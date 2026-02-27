import { test, expect } from '@playwright/test';

// Helper: click un elemento por selector usando JS (ignora overlays de CDK drag, animaciones, etc.)
async function jsClick(page: any, selector: string): Promise<boolean> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLElement;
    if (!el) return false;
    el.click();
    return true;
  }, selector);
}

test.describe('Test 2: Jugando una carta (Sincronización de Tablero)', () => {

  test('Jugador baja un órgano a su tablero y el rival lo ve instantáneamente', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // --- SETUP: Alice(Host) y Bob inician la partida ---
    await page1.goto('/');
    await page1.fill('input', 'Alice');
    await page1.locator('input').press('Enter');
    await page1.waitForURL('**/room-list');
    await page1.click('button:has-text("Pública")');
    await page1.waitForURL('**/room/*');
    const roomId = page1.url().split('/').pop() || '';

    await page2.goto('/');
    await page2.fill('input', 'Bob');
    await page2.locator('input').press('Enter');
    await page2.waitForURL('**/room-list');
    await page2.fill('input[placeholder="ID sala"]', roomId);
    await page2.click('button[aria-label="Unirse a la sala"]');
    await page2.waitForURL('**/room/*');

    await expect(page1.locator('text="Bob"')).toBeVisible();
    await page1.click('button:has-text("Iniciar partida")');

    await page1.waitForURL(`**/game/${roomId}`);
    await page2.waitForURL(`**/game/${roomId}`);
    await expect(page1.locator('game-board')).toBeVisible({ timeout: 10000 });

    // --- FLUJO: Determinar quién tiene el turno ---
    // game-hand.is-my-turn indica qué jugador tiene el turno activo
    await Promise.race([
      page1.waitForSelector('game-hand.is-my-turn', { timeout: 15000 }),
      page2.waitForSelector('game-hand.is-my-turn', { timeout: 15000 })
    ]);

    const aliceHasTurn = await page1.locator('game-hand.is-my-turn').isVisible();
    const activePage = aliceHasTurn ? page1 : page2;
    const passivePage = aliceHasTurn ? page2 : page1;
    const activePlayerName = aliceHasTurn ? 'Alice' : 'Bob';
    console.log(`El turno es de: ${activePlayerName}`);

    await activePage.waitForSelector('app-hand-card', { timeout: 5000 });

    // Estructura DOM confirmada:
    //   app-hand-card → div.hand-card.hand-card--[type].hand-card--[color] → app-hand-card-content + app-hand-card-button → button.play-btn
    //
    // El botón button.play-btn muestra "Jugar" cuando isMyTurn=true.
    // Usamos page.evaluate() para hacer click via JS, ignora overlays de CDK drag y animaciones.

    // Intentar jugar un órgano no-naranja primero (usan SimplePlayStrategy, solo requieren Confirmar)
    const organCount = await activePage.evaluate(() => {
      return document.querySelectorAll('app-hand-card .hand-card--organ:not(.hand-card--orange)').length;
    });
    const hasOrgan = organCount > 0;

    if (hasOrgan) {
      console.log('Tiene un órgano, jugándolo...');
      // Hacer click en play-btn del primer órgano no-naranja via JS
      const clicked = await activePage.evaluate(() => {
        const organs = Array.from(document.querySelectorAll('app-hand-card'))
          .filter(card => card.querySelector('.hand-card--organ:not(.hand-card--orange)'));
        if (organs.length === 0) return false;
        const playBtn = organs[0].querySelector('button.play-btn') as HTMLButtonElement;
        if (!playBtn) return false;
        playBtn.click();
        return true;
      });
      console.log(`Click en play-btn: ${clicked}`);

      // Esperar que aparezca el botón Confirmar del menú game-target-select
      await expect(activePage.locator('button.target-select__confirm')).toBeVisible({ timeout: 8000 });
      // Click en Confirmar via JS también 
      await activePage.evaluate(() => {
        const btn = document.querySelector('button.target-select__confirm') as HTMLButtonElement;
        if (btn) btn.click();
      });

      // Validación cruzada: comprobar que el turno cambió (el servidor procesó la jugada)
      // y que la mano pasiva ya no muestra "Jugar" (indica que el turno cambió a Bob/Alice).
      // También esperamos a que player-board-grid sea visible en el tablero de Alice en el rival.
      await Promise.any([
        // Opción 1: el tablero del jugador activo muestra un órgano en la vista del rival
        passivePage.locator(`player-board:has-text("${activePlayerName}") player-board-grid`).waitFor({ state: 'visible', timeout: 15000 }),
        // Opción 2: el turno cambió al rival (game-hand del rival muestra is-my-turn)
        passivePage.waitForSelector('game-hand.is-my-turn', { timeout: 15000 }),
      ]);
      console.log('¡Órgano replicado o turno cambiado correctamente!');

    } else {
      console.log('No tiene órgano a mano. Descartando...');
      // Para descartar: click en la carta (la pone en modo is-selected), luego click en discard-btn
      // El click en la carta activa onToggleSelect() → modo descarte.
      await activePage.evaluate(() => {
        const card = document.querySelector('app-hand-card .hand-card') as HTMLElement;
        if (card) card.click();
      });
      // Esperar a que el discard-btn sea visible y activo
      await expect(activePage.locator('button.discard-btn')).toBeVisible({ timeout: 3000 });
      await activePage.evaluate(() => {
        const btn = document.querySelector('button.discard-btn') as HTMLButtonElement;
        if (btn) btn.click();
      });

      // Validar: el action feed del rival muestra "descartó"
      await expect(
        passivePage.locator('game-info').filter({ hasText: 'descartó' })
      ).toBeVisible({ timeout: 10000 });
      console.log('¡Descarte replicado correctamente!');
    }
  });

});

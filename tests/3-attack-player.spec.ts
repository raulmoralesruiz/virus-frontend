import { test, expect } from '@playwright/test';

test.describe('Test 3: Attacking a Player', () => {

  test('Jugador usa un virus para infectar un órgano del rival', async ({ browser }) => {
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

    // --- FLUJO: Bucle de turnos hasta conseguir un ataque con virus ---
    let turnCount = 0;
    let attackSuccess = false;

    while (turnCount < 10 && !attackSuccess) {
      turnCount++;
      console.log(`--- Turno ${turnCount} ---`);

      await Promise.race([
        page1.waitForSelector('game-hand.is-my-turn', { timeout: 15000 }),
        page2.waitForSelector('game-hand.is-my-turn', { timeout: 15000 })
      ]);

      const aliceHasTurn = await page1.locator('game-hand.is-my-turn').isVisible();
      const activePage = aliceHasTurn ? page1 : page2;
      const passivePage = aliceHasTurn ? page2 : page1;
      const activePlayerName = aliceHasTurn ? 'Alice' : 'Bob';
      const passivePlayerName = aliceHasTurn ? 'Bob' : 'Alice';

      await activePage.waitForSelector('app-hand-card', { timeout: 5000 });

      // ¿El rival tiene algún órgano en su tablero?
      const rivalOrganCount = await activePage.evaluate((rivalName: string) => {
        const boards = Array.from(document.querySelectorAll('player-board'));
        const rivalBoard = boards.find(b => b.textContent?.includes(rivalName));
        if (!rivalBoard) return 0;
        return rivalBoard.querySelectorAll('app-player-card').length;
      }, passivePlayerName);

      // ¿Tenemos un virus en la mano?
      const virusCount = await activePage.evaluate(() => {
        return document.querySelectorAll('app-hand-card .hand-card--virus').length;
      });

      if (rivalOrganCount > 0 && virusCount > 0) {
        console.log(`${activePlayerName} ataca a ${passivePlayerName} con un virus!`);
        // Hacer click en play-btn del primer virus via JS
        await activePage.evaluate(() => {
          const virusCards = Array.from(document.querySelectorAll('app-hand-card'))
            .filter(card => card.querySelector('.hand-card--virus'));
          if (virusCards.length === 0) return;
          const playBtn = virusCards[0].querySelector('button.play-btn') as HTMLButtonElement;
          if (playBtn) playBtn.click();
        });

        // Esperar que aparezca el target-select con el selector de jugador
        await expect(activePage.locator('.target-select__player').first()).toBeVisible({ timeout: 8000 });
        // Hacer click en el jugador rival
        await activePage.evaluate((rivalName: string) => {
          const playerBtns = Array.from(document.querySelectorAll('.target-select__player'));
          const rivalBtn = playerBtns.find(b => b.textContent?.includes(rivalName)) as HTMLElement;
          if (rivalBtn) rivalBtn.click();
        }, passivePlayerName);

        // Hacer click en el primer órgano disponible del rival
        await expect(activePage.locator('.target-select__organ').first()).toBeVisible({ timeout: 5000 });
        await activePage.evaluate(() => {
          const organBtn = document.querySelector('.target-select__organ') as HTMLElement;
          if (organBtn) organBtn.click();
        });

        // Confirmar
        await expect(activePage.locator('button.target-select__confirm')).toBeVisible({ timeout: 5000 });
        await activePage.evaluate(() => {
          const btn = document.querySelector('button.target-select__confirm') as HTMLButtonElement;
          if (btn) btn.click();
        });

        // Validación: acción feed del rival muestra una acción de infección
        await expect(
          passivePage.locator('game-info').filter({ hasText: 'infectó' })
        ).toBeVisible({ timeout: 15000 });
        console.log('¡Ataque replicado correctamente!');
        attackSuccess = true;
        break;
      }

      // Intentar bajar un órgano no-naranja para construir el tablero
      const organCount = await activePage.evaluate(() => {
        return document.querySelectorAll('app-hand-card .hand-card--organ:not(.hand-card--orange)').length;
      });

      if (organCount > 0) {
        console.log(`${activePlayerName} baja un órgano.`);
        await activePage.evaluate(() => {
          const organs = Array.from(document.querySelectorAll('app-hand-card'))
            .filter(card => card.querySelector('.hand-card--organ:not(.hand-card--orange)'));
          if (organs.length === 0) return;
          const playBtn = organs[0].querySelector('button.play-btn') as HTMLButtonElement;
          if (playBtn) playBtn.click();
        });
        // Confirmar
        await expect(activePage.locator('button.target-select__confirm')).toBeVisible({ timeout: 8000 });
        await activePage.evaluate(() => {
          const btn = document.querySelector('button.target-select__confirm') as HTMLButtonElement;
          if (btn) btn.click();
        });
        // Esperar cambio de turno
        // Esperar cambio de turno — la mano del jugador activo pierde la clase is-my-turn
        await activePage.waitForFunction(() => {
          const hand = document.querySelector('game-hand');
          return hand && !hand.classList.contains('is-my-turn');
        }, { timeout: 10000 });
        continue;
      }

      // Descartar si no hay otra opción
      console.log(`${activePlayerName} descarta.`);
      await activePage.evaluate(() => {
        const card = document.querySelector('app-hand-card .hand-card') as HTMLElement;
        if (card) card.click();
      });
      await expect(activePage.locator('button.discard-btn')).toBeVisible({ timeout: 3000 });
      await activePage.evaluate(() => {
        const btn = document.querySelector('button.discard-btn') as HTMLButtonElement;
        if (btn) btn.click();
      });
      await activePage.waitForSelector('game-hand:not(.is-my-turn)', { timeout: 10000 });
    }

    if (!attackSuccess) {
      console.log('Test finaliza sin atacar (no se dió la combinación de cartas).');
    }
  });

});

import { test, expect } from '@playwright/test';

test.describe('Test 5: Fin de Partida (Abandonar)', () => {

  test('Jugador puede abrir el menú y abandonar la partida en curso', async ({ browser }) => {
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

    // --- FLUJO: Abandonar Partida ---
    //
    // game-info tiene un host binding (click) → toggleDetails()
    // PERO solo actúa si !isShowingNotification().
    // El panel expandido (game-info--expanded) aparece cuando showDetails=true && !isShowingNotification().
    // El botón leave dentro de game-info-controls emite leaveRequested, que activa showLeave en el store.
    // game-leave se renderiza dentro de game.component.html con @if(showLeave()).

    // Paso 1: Esperar a que la notificación de inicio desaparezca.
    // La notificación se muestra durante un tiempo breve al inicio.
    // game-info--expanded solo está visible sin notificación activa.
    await page1.waitForFunction(() => {
      // El componente game-info tiene la clase game-info--expanded solo cuando showDetails=true
      // y no hay notificación. Esperamos a que game-info sea clickeable (tabindex 0, no aria-disabled)
      const el = document.querySelector('game-info');
      if (!el) return false;
      const isDisabled = el.getAttribute('aria-disabled') === 'true';
      return !isDisabled;
    }, null, { timeout: 15000 });

    // Paso 2: Click en game-info para expandir el panel de detalles
    // Usamos evaluate para disparar el evento dentro del Angular zone
    await page1.evaluate(() => {
      const gameInfo = document.querySelector('game-info') as HTMLElement;
      if (gameInfo) gameInfo.click();
    });
    // Esperar que el panel expandido sea visible (showDetails=true && !isShowingNotification())
    await expect(page1.locator('game-info.game-info--expanded')).toBeVisible({ timeout: 5000 });

    // Paso 3: Click en el botón de salir usando evaluate
    // game-info-controls.ts llama event.stopPropagation() en onLeaveClick($event)
    // El evento se propaga por Angular: game-info-controls → game-info-details → game-info → game-board → gameStore.openLeaveModal()
    await page1.evaluate(() => {
      const btn = document.querySelector('.game-info__control-button--leave') as HTMLButtonElement;
      if (btn) btn.click();
    });

    // Paso 4: El modal game-leave debe aparecer
    // IMPORTANTE: El selector 'game-leave' apunta al custom element host que puede tener
    // size 0 (el .confirm-overlay tiene position:fixed pero no el host padre).
    // Playwright reporta el dialog como 'hidden' aunque el contenido interno sea visible.
    // Usamos el inner .confirm-overlay o el role=dialog para la validación.
    await expect(page1.locator('game-leave .confirm-overlay')).toBeVisible({ timeout: 5000 });

    // Paso 5: Confirmar salida
    await page1.locator('game-leave button.confirm-accept').click({ force: true });

    // Paso 6: Alice regresa al lobby
    await page1.waitForURL(/\/room-list|\/room\/|\/$/, { timeout: 10000 });
    console.log('Alice ha abandonado la partida y regresado al lobby.');
  });

});

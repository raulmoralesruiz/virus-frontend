import { test, expect, Page } from '@playwright/test';

/**
 * Test 6: Reacciones (emotes) sociales.
 *
 * Flujo:
 *   1. Alice (host) y Bob crean la sala e inician la partida.
 *   2. Alice pulsa un emote (🔥) en su barra de acciones.
 *   3. El backend lo enruta a TODA la sala (incluida Alice): cada uno ve la
 *      burbuja flotar SOBRE EL TABLERO DE ALICE (el remitente).
 *   4. A los ~3,5 s la burbuja expira y desaparece (sin estado persistente:
 *      no queda nada en el historial ni en el tablero).
 *
 * El emote no depende del turno ni de la mano: es una reacción social válida
 * en cualquier momento de la partida.
 */
test.describe('Test 6: Reacciones (emotes)', () => {
  test('Alice emite 🔥 y Bob lo ve flotar sobre el tablero de Alice; luego expira', async ({
    browser,
  }) => {
    const ctxOptions = { reducedMotion: 'reduce' as const };
    const context1 = await browser.newContext(ctxOptions);
    const context2 = await browser.newContext(ctxOptions);

    const page1 = await context1.newPage(); // Alice (Host)
    const page2 = await context2.newPage(); // Bob

    const stabilize = async (page: Page) => {
      await page.addStyleTag({
        content:
          '*, *::before, *::after { animation: none !important; transition: none !important; }',
      });
    };
    await stabilize(page1);
    await stabilize(page2);

    try {
      // --- SETUP: Alice y Bob entran a la sala e inician la partida ---
      await page1.goto('/');
      await page1.fill('input', 'Alice');
      await page1.locator('input').press('Enter');
      await page1.waitForURL('**/room-list', { timeout: 10_000 });
      await page1.click('button:has-text("Pública")');
      await page1.waitForURL('**/room/*', { timeout: 10_000 });
      const roomId = page1.url().split('/').pop() || '';

      await page2.goto('/');
      await page2.fill('input', 'Bob');
      await page2.locator('input').press('Enter');
      await page2.waitForURL('**/room-list', { timeout: 10_000 });
      await page2.fill('input[placeholder="ID sala"]', roomId);
      await page2.click('button[aria-label="Unirse a la sala"]');
      await page2.waitForURL('**/room/*', { timeout: 10_000 });

      await expect(page1.locator('text="Bob"')).toBeVisible({ timeout: 10_000 });
      await page1.click('button:has-text("Iniciar partida")');

      await page1.waitForURL(`**/game/${roomId}`, { timeout: 15_000 });
      await page2.waitForURL(`**/game/${roomId}`, { timeout: 15_000 });
      await expect(page1.locator('game-board')).toBeVisible({ timeout: 10_000 });
      await page1.waitForTimeout(2_000); // estabiliza el estado inicial

      // --- FLUJO: Alice abre la bandeja y pulsa el emote 🔥 (2º botón) ---
      // La bandeja nace colapsada: los 6 botones no están en el DOM hasta pulsar el trigger.
      await expect(page1.locator('.emote-tray__btn')).toHaveCount(0);
      const trayTrigger = page1.locator('.emote-tray__trigger');
      await expect(trayTrigger).toBeVisible({ timeout: 5_000 });
      await trayTrigger.click();
      await expect(page1.locator('.emote-tray__btn')).toHaveCount(6);

      const fireBtn = page1.locator('.emote-tray__btn').nth(1);
      await fireBtn.click();

      // Autoclose: enviado el emote, el panel vuelve a pliegarse.
      await expect(page1.locator('.emote-tray__btn')).toHaveCount(0);

      // 1) Bob ve la burbuja 🔥 SOBRE EL TABLERO DE ALICE (la remitente).
      const aliceBoardOnBobPage = page2.locator('player-board', { hasText: 'Alice' }).first();
      const bubbleOnBobPage = aliceBoardOnBobPage
        .locator('.emote-bubbles__bubble')
        .filter({ hasText: '🔥' });
      await expect(bubbleOnBobPage).toBeVisible({ timeout: 8_000 });
      console.log('Bob ve el 🔥 sobre el tablero de Alice ✓');

      // La burbuja NO debe aparecer sobre el tablero de Bob (el emote es de Alice).
      const bobBoardOnBobPage = page2.locator('player-board', { hasText: 'Bob' }).first();
      await expect(
        bobBoardOnBobPage.locator('.emote-bubbles__bubble').filter({ hasText: '🔥' })
      ).toHaveCount(0);
      console.log('El 🔥 NO aparece sobre el tablero de Bob ✓');

      // 2) Alice (la remitente) también lo ve: el broadcast incluye al emisor.
      const aliceBoardOnAlicePage = page1.locator('player-board', { hasText: 'Alice' }).first();
      const bubbleOnAlicePage = aliceBoardOnAlicePage
        .locator('.emote-bubbles__bubble')
        .filter({ hasText: '🔥' });
      await expect(bubbleOnAlicePage).toBeVisible({ timeout: 8_000 });
      console.log('Alice (emisor) ve el 🔥 sobre su propio tablero ✓');

      // 3) Expiración: a los ~3,5 s el store lo elimina del DOM (TTL).
      await expect(bubbleOnBobPage).toHaveCount(0, { timeout: 10_000 });
      await expect(bubbleOnAlicePage).toHaveCount(0, { timeout: 10_000 });
      console.log('La burbuja expiró y desapareció en ambas pantallas ✓');
    } finally {
      await context1.close().catch(() => undefined);
      await context2.close().catch(() => undefined);
    }
  });
});

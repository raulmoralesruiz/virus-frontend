import { test, expect } from '@playwright/test';

test.describe('Test 1: Game Start', () => {

  test('Host puede iniciar la partida y ambos jugadores son redirigidos al tablero', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage(); // Alice (Host)
    const page2 = await context2.newPage(); // Bob

    // --- SETUP: Alice y Bob entran a la sala ---
    await page1.goto('/');
    await page1.fill('input', 'Alice');
    await page1.locator('input').press('Enter'); 
    await page1.waitForURL('**/room-list', { timeout: 10000 });
    await page1.click('button:has-text("Pública")');
    await page1.waitForURL('**/room/*');
    const roomUrl = page1.url();
    const roomId = roomUrl.split('/').pop() || '';

    await page2.goto('/');
    await page2.fill('input', 'Bob');
    await page2.locator('input').press('Enter');
    await page2.waitForURL('**/room-list', { timeout: 10000 });
    await page2.fill('input[placeholder="ID sala"]', roomId);
    await page2.click('button[aria-label="Unirse a la sala"]');
    await page2.waitForURL('**/room/*');

    await expect(page1.locator(`text="Bob"`)).toBeVisible();

    // --- FLUJO: Iniciar Partida ---
    // Alice (Host) clickea Iniciar partida. Solo ella debería tener el botón visible.
    const startButton = page1.locator('button:has-text("Iniciar partida")');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
    
    // Bob no debería tener el botón
    await expect(page2.locator('button:has-text("Iniciar partida")')).toHaveCount(0);
    await expect(page2.locator('.waiting-copy')).toBeVisible();

    // Alice pulsa el botón
    await startButton.click();

    // --- VALIDACIÓN: Redirección al juego ---
    // Ambos navegadores deberían navegar automáticamente a /game/[roomId]
    await page1.waitForURL(`**/game/${roomId}`, { timeout: 10000 });
    await page2.waitForURL(`**/game/${roomId}`, { timeout: 10000 });

    // Validar que un elemento básico del tablero es visible para ambos
    await expect(page1.locator('game-board')).toBeVisible({ timeout: 15000 });
    await expect(page2.locator('game-board')).toBeVisible({ timeout: 15000 });
  });
});

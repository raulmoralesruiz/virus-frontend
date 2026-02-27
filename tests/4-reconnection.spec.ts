import { test, expect } from '@playwright/test';

test.describe('Test 4: Reconexión en medio de la partida', () => {

  test('Jugador recarga la página y recupera su sesión en la sala de juego activa', async ({ browser }) => {
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
    const roomUrl = page1.url();
    const roomId = roomUrl.split('/').pop() || '';

    await page2.goto('/');
    await page2.fill('input', 'Bob');
    await page2.locator('input').press('Enter');
    await page2.waitForURL('**/room-list');
    await page2.fill('input[placeholder="ID sala"]', roomId);
    await page2.click('button[aria-label="Unirse a la sala"]');
    await page2.waitForURL('**/room/*');

    await expect(page1.locator(`text="Bob"`)).toBeVisible();
    await page1.click('button:has-text("Iniciar partida")');

    await page1.waitForURL(`**/game/${roomId}`);
    await page2.waitForURL(`**/game/${roomId}`);
    await expect(page1.locator('game-board')).toBeVisible({ timeout: 10000 });

    // --- FLUJO: Reconexión ---
    console.log('Alice está en la partida. Simulando caída de conexión o recarga (F5)...');
    await page1.reload(); // Recarga toda la aplicación (borra memoria no persistida)
    
    // Al recargar (suponiendo que fue guardado en localStorage), nuestra app debe
    // intentar conectarse de nuevo automáticamente y meternos de nuevo en /game/[roomId]
    // o llevarnos ahí si redirigimos. 
    
    // Si la APP redirige a Home primero, debería auto-redigir al game
    
    // Validamos que volvemos a ver la tabla y la partida de Alice sigue activa
    await page1.waitForURL(`**/game/${roomId}`, { timeout: 15000 });
    await expect(page1.locator('game-board')).toBeVisible({ timeout: 10000 });
    
    // Bob debería seguir viéndola en partida
    await expect(page2.locator('player-board:has-text("Alice")')).toBeVisible({ timeout: 5000 });
    
    console.log('¡Alice se ha reconectado y restaurado su tablero satisfactoriamente!');
  });

});

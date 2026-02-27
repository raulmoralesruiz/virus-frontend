import { test, expect } from '@playwright/test';

test.describe('Real-time Game Lobby', () => {

  test('Jugador 1 crea una sala y Jugador 2 se une, ambos se ven', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // --- Jugador 1 (Alice) ---
    page1.on('console', msg => console.log(`Page1: ${msg.text()}`));
    await page1.goto('/');
    
    // Introducir nombre y entrar con Enter
    await page1.fill('input', 'Alice');
    await page1.locator('input').press('Enter'); 

    // Esperar a estar en el room-list para crear sala
    await page1.waitForURL('**/room-list', { timeout: 10000 });
    
    // Crear una sala pública
    await page1.click('button:has-text("Pública")');
    await page1.waitForURL('**/room/*');
    const roomUrl = page1.url();
    const roomId = roomUrl.split('/').pop() || '';

    // --- Jugador 2 (Bob) ---
    page2.on('console', msg => console.log(`Page2: ${msg.text()}`));
    await page2.goto('/');
    
    // Introducir nombre y entrar
    await page2.fill('input', 'Bob');
    await page2.locator('input').press('Enter');

    // Esperar a estar en el room-list
    await page2.waitForURL('**/room-list', { timeout: 10000 });
    
    // Bob se une introduciendo el ID exacto de la sala generada por Alice
    await page2.fill('input[placeholder="ID sala"]', roomId);
    await page2.click('button[aria-label="Unirse a la sala"]');
    await page2.waitForURL('**/room/*');

    // --- Validaciones Cruzadas en Tiempo Real ---
    // Alice debería ver que Bob ha entrado a su sala
    await expect(page1.locator(`text="Bob"`)).toBeVisible();
    
    // Bob debería ver que Alice está en la sala a la que se unió
    await expect(page2.locator(`text="Alice"`)).toBeVisible();
  });
});


import { test, expect } from '@playwright/test';

// Helper: click un elemento por selector usando JS (ignora overlays de CDK drag y animaciones)
async function jsClick(page: any, selector: string): Promise<boolean> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLElement;
    if (!el) return false;
    el.click();
    return true;
  }, selector);
}

async function setupGame(browser: any) {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const page1 = await context1.newPage(); // Alice (Host)
  const page2 = await context2.newPage(); // Bob

  await page1.goto('/');
  await page1.fill('input', 'Alice');
  await page1.locator('input').press('Enter');
  await page1.waitForURL('**/room-list', { timeout: 10000 });
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

  // webkit en este entorno es lento/inestable cerrando el WS del join de sala
  // (afecta también al test 1 preexistente); damos margen al sync de la sala.
  await expect(page1.locator('text="Bob"')).toBeVisible({ timeout: 20000 });
  await expect(page2.locator('text="Alice"')).toBeVisible({ timeout: 20000 });
  await page1.click('button:has-text("Iniciar partida")');
  await page1.waitForURL(`**/game/${roomId}`, { timeout: 20000 });
  await page2.waitForURL(`**/game/${roomId}`, { timeout: 20000 });
  await expect(page1.locator('game-board')).toBeVisible({ timeout: 15000 });

  return { page1, page2 };
}

test.describe('Test 7: Pasar turno y ayuda in-game', () => {

  test('El botón «Pasar turno» termina el turno sin jugar y pasa al rival', async ({ browser }) => {
    const { page1, page2 } = await setupGame(browser);

    // Determinar quién tiene el turno
    await Promise.race([
      page1.waitForSelector('game-hand.is-my-turn', { timeout: 15000 }),
      page2.waitForSelector('game-hand.is-my-turn', { timeout: 15000 })
    ]);
    const aliceHasTurn = await page1.locator('game-hand.is-my-turn').isVisible();
    const activePage = aliceHasTurn ? page1 : page2;
    const passivePage = aliceHasTurn ? page2 : page1;

    // El botón existe y está habilitado para el jugador activo
    const passBtn = activePage.locator('button.pass-btn');
    await expect(passBtn).toBeVisible();
    await expect(passBtn).toHaveText('Pasar turno');
    await expect(passBtn).toBeEnabled();

    // El rival lo ve deshabilitado (no es su turno)
    await expect(passivePage.locator('button.pass-btn')).toBeDisabled();

    // Pulsar «Pasar turno»
    const clicked = await jsClick(activePage, 'button.pass-btn');
    expect(clicked).toBe(true);

    // El turno debe pasar al rival
    await expect(passivePage.locator('game-hand.is-my-turn')).toBeVisible({ timeout: 15000 });
    await expect(activePage.locator('game-hand.is-my-turn')).toHaveCount(0);
  });

  test('La ayuda «?» abre un diálogo con las reglas y se cierra con Escape', async ({ browser }) => {
    const { page1 } = await setupGame(browser);

    // El botón «?» está en la cabecera del tablero
    const helpBtn = page1.locator('button.help-toggle');
    await expect(helpBtn).toBeVisible();
    await expect(helpBtn).toHaveAttribute('aria-expanded', 'false');

    await helpBtn.click();

    const dialog = page1.locator('.help-modal');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(page1.locator('button.help-toggle')).toHaveAttribute('aria-expanded', 'true');

    // Resumen de reglas
    const text = await page1.locator('.help-body').textContent();
    expect(text).toContain('4 órganos sanos de colores distintos');
    expect(text).toContain('Aparición');

    // Link a las reglas completas
    const link = page1.locator('a.help-link');
    await expect(link).toBeVisible();

    // Escape lo cierra
    await page1.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});

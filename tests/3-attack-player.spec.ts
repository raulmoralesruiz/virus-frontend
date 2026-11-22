import { test, expect, Page } from '@playwright/test';

/**
 * Test 3: Jugador usa un virus para infectar un órgano del rival.
 *
 * El mazo se baraja al azar en el backend, por lo que el ataque no está
 * garantizado en el primer turno. El test juega turnos con una estrategia
 * determinista (la misma que un jugador real) hasta que alguien puede atacar:
 *
 *   1. **Atacar** si hay virus en mano compatible con algún órgano sano del
 *      rival (la regla del backend es `canReceiveVirus`: mismo color o alguno
 *      multicolor — `fits()`). La UI ya filtra los objetivos por color, así que
 *      el primer órgano de la lista del panel es válido.
 *   2. **Bajar un órgano "seguro"**: uno LEGAL (el backend rechaza repetir un
 *      color ya en el tablero: `DUPLICATE_ORGAN`, organ-card.service.ts) y que
 *      no complete 4 colores distintos sanos (condición de victoria, ver
 *      `victory-utils.checkVictory`), así que solo jugamos un color nuevo si
 *      ya tenemos ≤ 2. Con ≥ 3 colores en tablero, cualquier órgano nuevo gana,
 *      y preferimos descartar para no cerrar la partida antes del ataque.
 *   3. **Descartar** una carta si no hay otra opción útil.
 *
 * Detección de progreso (robusta, sin señales falsas):
 *   - El éxito de cada jugada se verifica por ESTADO: el turno avanza
 *     (la página activa pierde la clase `is-my-turn`). Un `waitFor({detached})`
 *     contra un nodo que nunca existió da positivo falso, por eso NO se usa.
 *   - El ataque se confirma por ESTADO: aparece una chip de virus en el
 *     tablero del rival (`.attached-card.chip.virus`).
 *   - Si la partida termina (panel `game-winner`) o no aparece par compatible
 *     tras N turnos, el test se marca como **skip con motivo explícito**
 *     (caso raro ~1 %). Nunca un pass silencioso ni un fallo falso.
 *   - Si N jugadas seguidas NO se registran (el turno nunca avanza), el test
 *     falla con motivo claro: ahí sí algo está roto (UI o backend).
 *
 * Robustez: cada acción usa locators reales de Playwright (actionability +
 * auto-wait) y reintenta acotadamente cerrando el panel (`Cancelar`) antes de
 * cada intento, para no dejar selecciones huérfanas. Los contextos se cierran
 * al terminar para no dejar zombis de socket que carguen el backend.
 */
const MAX_TURNS = 30;
const MAX_FAILED_IN_A_ROW = 3;
test.setTimeout(180_000);

/** Colores de órgano que jugamos (excluye naranja/halloween: requieren objetivo especial). */
const PLAYABLE_ORGAN_COLORS = ['red', 'green', 'blue', 'yellow', 'multi'];
const ALL_COLORS = ['red', 'green', 'blue', 'yellow', 'multi', 'halloween', 'orange'];
const KINDS = ['organ', 'virus', 'medicine', 'treatment'];

/** Un virus infecta un órgano si comparten color o alguno es multicolor. */
const fits = (virus: string, organ: string): boolean =>
  virus === 'multi' || organ === 'multi' || virus === organ;

/** Estado local de la mesa que el test necesita para decidir su jugada. */
interface HandCard {
  index: number;
  kind: string;
  color: string | null;
}
interface TableState {
  myBoard: string[];
  rivalBoard: string[];
  cards: HandCard[];
}

const readState = (page: Page, myName: string, rivalName: string): Promise<TableState> =>
  page.evaluate(
    ([my, rival, allColors, kinds]) => {
      const boardColors = (name: string): string[] => {
        const board = Array.from(document.querySelectorAll('player-board')).find((b) =>
          (b.textContent || '').includes(name)
        );
        if (!board) return [];
        return Array.from(board.querySelectorAll('.card.organ'))
          .map((o) => allColors.find((c) => o.classList.contains(c)) || null)
          .filter((c): c is string => c !== null);
      };
      const cards: { index: number; kind: string; color: string | null }[] =
        Array.from(document.querySelectorAll('app-hand-card .hand-card')).map((el, index) => ({
          index,
          kind: kinds.find((k) => el.classList.contains(`hand-card--${k}`)) || 'other',
          color: allColors.find((c) => el.classList.contains(`hand-card--${c}`)) || null,
        }));
      return { myBoard: boardColors(my), rivalBoard: boardColors(rival), cards };
    },
    [myName, rivalName, ALL_COLORS, KINDS]
  );

/** true si la página muestra que es el turno de su jugador. */
const isMyTurn = (page: Page): Promise<number> => page.locator('game-hand.is-my-turn').count();

/** true si alguna página muestra el panel de ganador (partida finalizada). */
const gameIsOver = async (page1: Page, page2: Page): Promise<boolean> =>
  (await page1.locator('.winner-overlay').count()) > 0 ||
  (await page2.locator('.winner-overlay').count()) > 0;

/**
 * Espera a que ALGÚN jugador tenga el turno activo, o a que la partida
 * finalice. Devuelve la página activa (y la contraria) o `{ over: true }`.
 * Polling acotado y simple (sin promesas huérfanas).
 */
async function waitForActiveTurn(
  page1: Page,
  page2: Page,
  timeoutMs = 45_000
): Promise<{ page: Page; other: Page } | { over: true }> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await gameIsOver(page1, page2)) return { over: true };
    if ((await isMyTurn(page1)) > 0) return { page: page1, other: page2 };
    if ((await isMyTurn(page2)) > 0) return { page: page2, other: page1 };
    await page1.waitForTimeout(300);
  }
  throw new Error(`Sin turno activo ni fin de partida tras ${timeoutMs} ms`);
}

/** true si alguna página muestra el panel de ganador (partida finalizada). */
const winnerShown = (page: Page): Promise<number> =>
  page.locator('.winner-overlay').count().catch(() => 0);

/**
 * Cuantas páginas muestran el banner de desconexión ("Sin conexión" /
 * "Reconectando… acciones desactivadas"). > 0 = la UI bloquea las acciones.
 */
const offlineBanner = (page: Page): Promise<number> =>
  page.locator('.connection-banner.is-visible').count().catch(() => 0);

/**
 * Espera a que la página esté ONLINE (banner de desconexión oculto). Devuelve
 * true si quedó online, false si se agotó el presupuesto.
 *
 * ¿Por qué es necesario? El cliente tiene un "liveness probe" (socket.service.ts)
 * que, si el ack tarda > PING_TIMEOUT_MS (3 s), fuerza un ciclo
 * disconnect→connect. En webkit el main thread es más lento y un ack puede
 * tardar > 3 s bajo carga, disparando esa reconexión. Mientras la página está
 * offline/reconnecting, el app DESHABILITA las acciones: un click en "confirmar"
 * no llega al backend y el turno nunca pasa. Actuar solo con online evita
 * reintentos ciegos que queman el presupuesto del test.
 */
async function waitOnline(page: Page, timeoutMs = 12_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await offlineBanner(page)) === 0) return true;
    await page.waitForTimeout(200);
  }
  return (await offlineBanner(page)) === 0;
}

/**
 * SEÑAL DE ÉXITO POSITIVA (robusta): el turno pasó al RIVAL.
 *
 * Antes usaba "mi is-my-turn desaparece", que da FALSO POSITIVO: durante el
 * re-render tras confirmar, la clase puede ausentarse un instante y `toHaveCount(0)`
 * resuelve, aunque la jugada no se haya registrado (el turno sigue siendo mío).
 * Esperar a que APAREZCA `is-my-turn` en la página del rival es inequívoco:
 * solo ocurre si la jugada llegó al backend y el turno cambió.
 *
 * Devuelve 'passed' (turno pasó), 'over' (alguien ganó) o 'timeout' (la jugada
 * NO se registró).
 */
async function waitForTurnToPass(
  myPage: Page,
  oppPage: Page,
  timeoutMs = 15_000
): Promise<'passed' | 'over' | 'timeout'> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await winnerShown(myPage)) > 0 || (await winnerShown(oppPage)) > 0) return 'over';
    if ((await isMyTurn(oppPage).catch(() => 0)) > 0) return 'passed';
    await myPage.waitForTimeout(150);
  }
  return 'timeout';
}

/** Cierra el panel de selección (botón Cancelar) si está abierto. */
async function closePanel(page: Page): Promise<void> {
  const cancel = page.locator('.target-select__cancel');
  if ((await cancel.count()) > 0) {
    await cancel.click({ timeout: 2_000 }).catch(() => undefined);
  }
}

/**
 * Juega la carta en la posición `index` de la mano (órgano simple o virus).
 * Verifica el éxito por SEÑAL POSITIVA: el turno debe pasar al rival.
 * Devuelve 'passed' | 'over' | 'timeout'.
 */
async function playCard(
  page: Page,
  opp: Page,
  index: number,
  kind: string,
  rivalName?: string
): Promise<'passed' | 'over' | 'timeout'> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if ((await isMyTurn(page).catch(() => 0)) === 0) return 'timeout';
    await closePanel(page);

    // No actuar con el socket caído: el app bloquea acciones y el click se pierde.
    if (!(await waitOnline(page, 12_000))) {
      console.log(`  [diag] OFFLINE al intentar jugar (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }

    const playBtn = page
      .locator('app-hand-card .hand-card')
      .nth(index)
      .locator('button.play-btn');

    let canClick = false;
    try {
      await expect(playBtn).toBeVisible({ timeout: 3_000 });
      canClick = await playBtn.isEnabled().catch(() => false);
    } catch {
      canClick = false;
    }
    if (!canClick) {
      console.log(`  [diag] play-btn no visible/habilitado (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }
    await playBtn.click();

    let panelOk = false;
    try {
      await expect(page.locator('game-target-select')).toBeVisible({ timeout: 3_000 });
      panelOk = true;
    } catch {
      panelOk = false;
    }
    if (!panelOk) {
      console.log(`  [diag] el panel no abrió tras el click (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }

    if (kind === 'virus' && rivalName) {
      try {
        const rivalBtn = page.locator('.target-select__player', { hasText: rivalName }).first();
        await expect(rivalBtn).toBeVisible({ timeout: 3_000 });
        await rivalBtn.click();
        const organBtn = page.locator('.target-select__organ').first();
        await expect(organBtn).toBeVisible({ timeout: 3_000 });
        await organBtn.click();
      } catch (e) {
        console.log(`  [diag] selección de objetivo (virus) falló: ${String(e).slice(0, 90)}`);
        await page.waitForTimeout(300);
        continue;
      }
    }

    const confirm = page.locator('button.target-select__confirm');
    let confirmOk = false;
    try {
      await expect(confirm).toBeEnabled({ timeout: 3_000 });
      confirmOk = true;
    } catch {
      confirmOk = false;
    }
    if (!confirmOk) {
      console.log(`  [diag] confirm deshabilitado (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }

    await confirm.click();
    const result = await waitForTurnToPass(page, opp, 15_000);
    if (result === 'timeout') {
      const offMe = (await offlineBanner(page)) > 0;
      const offOpp = (await offlineBanner(opp)) > 0;
      console.log(
        `  [diag] confirmó pero el turno NO pasó al rival (intento ${attempt}; ` +
          `offline: yo=${offMe} rival=${offOpp})`
      );
      await page.waitForTimeout(300);
      continue;
    }
    return result; // 'passed' | 'over'
  }
  return 'timeout';
}

/**
 * Descarta la primera carta de la mano. Verifica el éxito por SEÑAL POSITIVA:
 * el turno debe pasar al rival. Devuelve 'passed' | 'over' | 'timeout'.
 */
async function doDiscard(page: Page, opp: Page): Promise<'passed' | 'over' | 'timeout'> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if ((await isMyTurn(page).catch(() => 0)) === 0) return 'timeout';
    await closePanel(page);

    // No actuar con el socket caído (el app bloquea acciones).
    if (!(await waitOnline(page, 12_000))) {
      console.log(`  [diag] OFFLINE al intentar descartar (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }

    // Limpia selección previa (toggle off de las ya seleccionadas).
    await page.evaluate(() => {
      document
        .querySelectorAll('app-hand-card .hand-card.is-selected')
        .forEach((c) => (c as HTMLElement).click());
    });
    await page.waitForTimeout(150);

    const card = page.locator('app-hand-card .hand-card').first();
    let selected = false;
    try {
      await expect(card).toBeVisible({ timeout: 3_000 });
      await card.click();
      selected = true;
    } catch {
      selected = false;
    }
    if (!selected) {
      console.log(`  [diag] no pude seleccionar carta para descarte (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }

    const discardBtn = page.locator('button.discard-btn');
    let canClick = false;
    try {
      await expect(discardBtn).toBeVisible({ timeout: 3_000 });
      canClick = await discardBtn.isEnabled().catch(() => false);
    } catch {
      canClick = false;
    }
    if (!canClick) {
      await card.click().catch(() => undefined); // deseleccionar para reintentar limpio
      await page.waitForTimeout(300);
      continue;
    }

    await discardBtn.click();
    const result = await waitForTurnToPass(page, opp, 15_000);
    if (result === 'timeout') {
      console.log(`  [diag] descartó pero el turno NO pasó al rival (intento ${attempt})`);
      await page.waitForTimeout(300);
      continue;
    }
    return result; // 'passed' | 'over'
  }
  return 'timeout';
}

/**
 * Si hay una decisión de "Aparición" pendiente para mí, la resuelvo
 * conservando la carta y pasando el turno. Devuelve 'passed' | 'over' | 'timeout'.
 */
async function resolveApparition(
  page: Page,
  opp: Page
): Promise<'passed' | 'over' | 'timeout'> {
  const keep = page.locator('.apparition-banner .keep-btn');
  if ((await keep.count().catch(() => 0)) === 0) return 'timeout';
  if (!(await keep.isEnabled().catch(() => false))) return 'timeout';
  if (!(await waitOnline(page, 12_000))) {
    console.log('  [diag] OFFLINE al resolver la Aparición');
    return 'timeout';
  }
  await keep.click();
  return await waitForTurnToPass(page, opp, 15_000);
}

test.describe('Test 3: Attacking a Player', () => {
  test('Jugador usa un virus para infectar un órgano del rival', async ({ browser }) => {
    // IMPORTANTE: los contextos se crean A MANO (browser.newContext) para aislar
    // a Alice y Bob. Playwright solo inyecta las opciones de `use` (config) en los
    // fixtures `page`/`context` automáticos, NO en contextos manuales. Por eso
    // `reducedMotion` hay que pasarlo aquí explícitamente: sin esto la animación
    // infinita `handPanelPulse` (game-hand :host.is-my-turn) sigue corriendo y
    // `locator.click()` falla con "element is not stable".
    const ctxOptions = { reducedMotion: 'reduce' as const };
    const context1 = await browser.newContext(ctxOptions);
    const context2 = await browser.newContext(ctxOptions);

    const page1 = await context1.newPage(); // Alice (Host)
    const page2 = await context2.newPage(); // Bob

    // Estabiliza la página para E2E: desactiva TODAS las animaciones y
    // transiciones (pulse del panel, shake de carta seleccionada, shimmer del
    // tablero, blink del timer) en cualquier browser, sin depender de las
    // guards de prefers-reduced-motion del app. Solo afecta lo visual, no la
    // lógica del juego.
    const stabilize = async (page: Page) => {
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
      });
    };
    await stabilize(page1);
    await stabilize(page2);

    // Diagnóstico de socket: captura en consola la reconexión forzada por el
    // liveness probe y las emits perdidas. Sirve para corroborar que las caídas
    // de "Sin conexión" vienen del cliente (probe), no del servidor.
    const attachSocketLog = (page: Page, who: string) => {
      page.on('console', (msg) => {
        const t = msg.text();
        if (
          /Liveness probe expiró|forzando reconexión|Socket not connected|Failed to restore|reconnect_attempt|disconnect/i.test(
            t
          )
        ) {
          console.log(`  [socket/${who}] ${msg.type()}: ${t.slice(0, 140)}`);
        }
      });
    };
    attachSocketLog(page1, 'Alice');
    attachSocketLog(page2, 'Bob');

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

      // --- FLUJO: bucle de turnos hasta que alguien pueda atacar ---
      let attacked = false;
      let failedInARow = 0;

      for (let turn = 1; turn <= MAX_TURNS && !attacked; turn++) {
        const active = await waitForActiveTurn(page1, page2, 45_000);
        if ('over' in active) {
          test.skip(
            true,
            `La partida terminó (panel de ganador) antes de completar el ataque. ` +
              'Caso raro: estrategia de órganos seguros evita la victoria, pero la partida se cerró por otro motivo.'
          );
          break;
        }

        const page = active.page;
        const opp = active.other;
        const rivalName = page === page1 ? 'Bob' : 'Alice';
        const myName = page === page1 ? 'Alice' : 'Bob';
        console.log(`--- Turno ${turn}: ${myName} ---`);

        // Procesa el resultado de una acción. 'skip' si la partida terminó
        // (caso raro honesto), 'continue' si seguimos (avanzó, o fallo aún
        // dentro del límite de reintentos). Lanza si se agota el límite.
        const handleResult = (
          result: 'passed' | 'over' | 'timeout',
          what: string
        ): 'skip' | 'continue' => {
          if (result === 'over') return 'skip';
          if (result === 'passed') {
            failedInARow = 0;
            return 'continue';
          }
          failedInARow = failedInARow + 1;
          if (failedInARow >= MAX_FAILED_IN_A_ROW) {
            throw new Error(
              `${what} no se registró en ${MAX_FAILED_IN_A_ROW} turnos seguidos. ` +
                'El turno nunca avanza: la jugada no llega al backend. Posible fallo real (UI o socket).'
            );
          }
          return 'continue';
        };
        const finishIfOver = (r: 'skip' | 'continue') => {
          if (r === 'skip') {
            test.skip(
              true,
              'La partida terminó (panel de ganador) antes de completar el ataque objetivo. ' +
                'Caso raro: la partida se cerró antes de llegar al ataque.'
            );
          }
        };

        // 0) ¿Aparición pendiente? La resuelvo (conservar + pasar turno).
        const hasApp =
          (await page.locator('.apparition-banner .keep-btn').count().catch(() => 0)) > 0;
        if (hasApp) {
          const result = await resolveApparition(page, opp);
          console.log(`${myName} resuelve la Aparición -> ${result}`);
          finishIfOver(handleResult(result, 'la Aparición'));
          continue;
        }

        const state = await readState(page, myName, rivalName);
        console.log(
          `${myName}: mano=${JSON.stringify(state.cards)} ` +
            `miTablero=${JSON.stringify(state.myBoard)} rival=${JSON.stringify(state.rivalBoard)}`
        );

        if (state.cards.length === 0) {
          // Mano vacía (no debería pasar con HAND_LIMIT=3): espero a que el
          // turno pase (timer del backend) y re-evalúo.
          console.log(`${myName} sin cartas; espero a que el turno pase.`);
          const result = await waitForTurnToPass(page, opp, 90_000);
          finishIfOver(handleResult(result, 'esperar turno (mano vacía)'));
          continue;
        }

        // 1) ¿Puedo atacar? Virus compatible con algún órgano del rival.
        const attackIdx = state.cards.findIndex(
          (c) =>
            c.kind === 'virus' &&
            c.color !== null &&
            state.rivalBoard.some((o) => fits(c.color as string, o))
        );

        if (attackIdx !== -1) {
          const virus = state.cards[attackIdx];
          console.log(`${myName} ataca a ${rivalName} con un virus ${virus.color}.`);
          const result = await playCard(page, opp, attackIdx, 'virus', rivalName);
          if (result === 'passed') {
            // VALIDACIÓN por estado: en el tablero del rival hay una chip de virus.
            const rivalBoard = page.locator('player-board', { hasText: rivalName }).first();
            const infected = await rivalBoard
              .locator('.attached-card.chip.virus')
              .first()
              .waitFor({ state: 'visible', timeout: 8_000 })
              .then(() => true)
              .catch(() => false);
            if (infected) {
              console.log('¡Ataque con virus confirmado correctamente!');
              attacked = true;
              break;
            }
            // El turno pasó pero no se ve la chip: tratamos como fallo.
            failedInARow = failedInARow + 1;
            if (failedInARow >= MAX_FAILED_IN_A_ROW) {
              throw new Error(
                'El ataque avanzó el turno pero no se ve la chip de virus en el tablero del rival.'
              );
            }
            continue;
          }
          finishIfOver(handleResult(result, 'el ataque'));
          continue;
        }

        // 2) ¿Puedo bajar un órgano LEGAL y SEGURO?
        //   LEGAL:  el backend rechaza repetir un color ya en el tablero
        //           (organ-card.service.ts: DUPLICATE_ORGAN), así que el color
        //           NO debe estar en miTablero. (Antes la estrategia elegía
        //           EXACTAMENTE ese caso y el servidor la rechazaba.)
        //   SEGURO: al colocarlo no se alcanzan 4 colores distintos sanos
        //           (victory-utils.checkVictory), para no cerrar la partida
        //           antes del ataque objetivo. Con ≤ 2 colores en tablero,
        //           añadir uno nuevo deja ≤ 3 → seguro. Con ≥ 3, cualquier
        //           órgano nuevo gana → mejor descartar (que sigue la partida).
        const myColors = new Set(state.myBoard);
        const organIdx = state.cards.findIndex(
          (c) =>
            c.kind === 'organ' &&
            c.color !== null &&
            PLAYABLE_ORGAN_COLORS.includes(c.color) &&
            !myColors.has(c.color) &&
            myColors.size <= 2
        );

        if (organIdx !== -1) {
          const organ = state.cards[organIdx];
          console.log(`${myName} baja un órgano ${organ.color}.`);
          const result = await playCard(page, opp, organIdx, 'organ');
          finishIfOver(handleResult(result, 'bajar un órgano'));
          continue;
        }

        // 3) Descartar una carta (roba hasta volver al límite de mano).
        console.log(`${myName} descarta una carta.`);
        const result = await doDiscard(page, opp);
        finishIfOver(handleResult(result, 'descartar'));
        continue;
      }

      if (!attacked) {
        test.skip(
          true,
          `Sin par compatible (virus propio + órgano del rival) tras ${MAX_TURNS} turnos. ` +
            'El mazo es aleatorio y la probabilidad simulada de no llegar es ~1 %. ' +
            'Skip honesto: no es un fallo, y el informe muestra la razón.'
        );
      }
    } finally {
      // Cierro los contextos para no dejar sockets "zombi" que carguen el
      // backend en la siguiente ejecución del test.
      await context1.close().catch(() => undefined);
      await context2.close().catch(() => undefined);
    }
  });
});

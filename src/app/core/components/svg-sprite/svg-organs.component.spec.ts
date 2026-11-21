import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regresión: los trazos del sprite de órganos deben heredar el color
 * (currentColor) para que cada contexto de uso pueda elegir el tono con
 * suficiente contraste (WCAG 1.4.11). Un color fijo como #000000 hace
 * invisible el icono "organ-multi" sobre fondos claros.
 */
describe('svg-organs sprite', () => {
  const html = readFileSync(join(__dirname, 'svg-organs.component.html'), 'utf-8');

  it('no contiene colores fijos (#000000) en los trazos', () => {
    expect(html).not.toContain('#000000');
  });

  it('usa currentColor para el trazo/relleno de los símbolos', () => {
    expect(html).toContain('currentColor');
  });
});

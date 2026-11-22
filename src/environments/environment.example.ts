/**
 * Plantilla de referencia (NO se compila). Los entornos reales:
 *
 * - `environment.ts` / `environment.development.ts` (gitignoreados, solo dev local):
 *     export const environment = {
 *       production: false,
 *       baseUrl: 'http://localhost:3000/api',
 *       socketUrl: 'http://localhost:3000',
 *     };
 *
 * - `environment.production.ts` (bajo git, lo usa el build de producción vía
 *   `fileReplacements` en `angular.json`; es la única URL válida en LAN y público):
 *     export const environment = {
 *       production: true,
 *       baseUrl: 'https://virusbackend.raulmorales.eu/api',
 *       socketUrl: 'https://virusbackend.raulmorales.eu',
 *     };
 */
export const environment = {
  production: false,
  baseUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
};

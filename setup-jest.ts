
// Este proyecto es zoneless (provideZonelessChangeDetection en app.config.ts).
// zone.js solo existe como peer-dependency de @angular/core y NUNCA debe
// cargarse en tests: si aparece, rompe la línea base reproducible.
if (typeof Zone !== 'undefined') {
  throw new Error(
    'zone.js está cargado en el entorno de tests pero este proyecto es zoneless. ' +
      'Elimina cualquier import de zone.js y usa timers de Jest o whenStable() en lugar de fakeAsync/tick.',
  );
}

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: () => {},
});

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

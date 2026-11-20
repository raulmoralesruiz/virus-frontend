import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <button id="outer-before">Antes</button>
    <div appFocusTrap (escape)="onEscape()">
      <button id="trap-first">Primero</button>
      <button id="trap-last">Último</button>
    </div>
    <button id="outer-after">Después</button>
  `,
})
class HostComponent {
  escapeCount = 0;

  onEscape(): void {
    this.escapeCount++;
  }
}

describe('FocusTrapDirective', () => {
  let host: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let trap: HTMLElement;
  let first: HTMLButtonElement;
  let last: HTMLButtonElement;

  const keydown = (key: string, shiftKey = false): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    trap.dispatchEvent(event);
    return event;
  };

  const createHost = () => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
    trap = fixture.nativeElement.querySelector('div');
    first = fixture.nativeElement.querySelector('#trap-first');
    last = fixture.nativeElement.querySelector('#trap-last');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusTrapDirective],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('debe mover el foco al primer elemento enfocable al abrir', () => {
    createHost();
    expect(document.activeElement).toBe(first);
  });

  it('Tab en el último elemento debe ciclar al primero', () => {
    createHost();
    last.focus();
    const event = keydown('Tab');
    expect(document.activeElement).toBe(first);
    expect(event.defaultPrevented).toBe(true);
  });

  it('Shift+Tab en el primero debe ciclar al último', () => {
    createHost();
    first.focus();
    const event = keydown('Tab', true);
    expect(document.activeElement).toBe(last);
    expect(event.defaultPrevented).toBe(true);
  });

  it('debe emitir escape al pulsar Escape', () => {
    createHost();
    first.focus();
    keydown('Escape');
    expect(host.escapeCount).toBe(1);
  });

  it('debe dejar pasar otras teclas sin emitir', () => {
    createHost();
    first.focus();
    keydown('Enter');
    expect(host.escapeCount).toBe(0);
  });

  it('debe devolver el foco al elemento previo al cerrar', () => {
    // Crear el fixture sin detectChanges: los elementos ya están en el DOM
    // pero la directiva aún no se ha inicializado (ngOnInit corre en el
    // primer ciclo de detección de cambios).
    fixture = TestBed.createComponent(HostComponent);
    const outer = fixture.nativeElement.querySelector(
      '#outer-before',
    ) as HTMLButtonElement;
    outer.focus();
    expect(document.activeElement).toBe(outer);

    fixture.detectChanges();
    host = fixture.componentInstance;
    trap = fixture.nativeElement.querySelector('div');
    first = fixture.nativeElement.querySelector('#trap-first');
    last = fixture.nativeElement.querySelector('#trap-last');
    expect(document.activeElement).toBe(first);

    fixture.destroy();
    expect(document.activeElement).toBe(outer);
  });
});

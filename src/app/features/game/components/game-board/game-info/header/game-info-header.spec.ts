import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInfoHeaderComponent } from './game-info-header';

describe('GameInfoHeader', () => {
  let fixture: ComponentFixture<GameInfoHeaderComponent>;
  let component: GameInfoHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameInfoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const toggle = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button.game-info-header__toggle');

  it('debe renderizar el toggle como <button> nativo dentro del <h2> de sala', () => {
    const btn = toggle();
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.type).toBe('button');
    const heading = fixture.nativeElement.querySelector('h2.game-info-header__heading');
    expect(heading.contains(btn)).toBe(true);
  });

  it('no debe anidar otro <h2> dentro del botón', () => {
    const headings = fixture.nativeElement.querySelectorAll('h2');
    expect(headings.length).toBe(1);
    expect(toggle().querySelector('h2')).toBeNull();
  });

  it('debe reflejar el estado expandido en aria-expanded', () => {
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    fixture.componentRef.setInput('showDetails', true);
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });

  it('debe apuntar con aria-controls al panel de detalles', () => {
    expect(toggle().getAttribute('aria-controls')).toBe('game-info-details-panel');
  });

  it('debe emitir toggleRequested al pulsarse', () => {
    const spy = jest.spyOn(component.toggleRequested, 'emit');
    toggle().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('no debe depender de manejadores de teclado manuales', () => {
    // <button> nativo: Enter/Espacio activan el click sin (keydown) a mano.
    expect(component).not.toHaveProperty('onToggleKeydown');
  });
});

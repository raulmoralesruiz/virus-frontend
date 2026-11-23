import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionContentComponent } from './game-action-content';

describe('GameActionContentComponent', () => {
  let component: GameActionContentComponent;
  let fixture: ComponentFixture<GameActionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameActionContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameActionContentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('action', {
      id: 'a1',
      type: 'draw',
      actor: 'Alice',
      message: '',
    } as any);
    fixture.detectChanges();
  });

  it('no debe contener botones: el cierre es un adorno y el toast es el botón', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    const close = fixture.nativeElement.querySelector('.action-feed__close');
    expect(close).toBeTruthy();
    expect(close.tagName).toBe('SPAN');
    expect(close.getAttribute('aria-hidden')).toBe('true');
  });

  it('debe mantener la marca "×" visible para el usuario de puntero', () => {
    const mark = fixture.nativeElement.querySelector('.action-feed__close span');
    expect(mark.textContent).toBe('x');
  });
});

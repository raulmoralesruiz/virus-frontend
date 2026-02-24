import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoDiscardComponent } from './game-info-discard';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';

describe('GameInfoDiscardComponent', () => {
  let component: GameInfoDiscardComponent;
  let fixture: ComponentFixture<GameInfoDiscardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameInfoDiscardComponent],
    });
    fixture = TestBed.createComponent(GameInfoDiscardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize empty', () => {
    expect(component.displayImage()).toBeNull();
    expect(component.colorThiefColor()).toBeNull();
    expect(component.discardBackground()).toBe('transparent');
    
    // Check host bindings for empty state
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.background).toBe('transparent');
    expect(hostEl.classList.contains('discard-preview--empty')).toBe(true);
    expect(hostEl.getAttribute('aria-label')).toBe('Pila de descartes vacía');
  });

  it('should calculate properties when topDiscard changes to an organ', () => {
    const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Red } as Card;
    fixture.componentRef.setInput('topDiscard', card);
    fixture.componentRef.setInput('discardCount', 3);
    fixture.detectChanges();

    expect(component.displayImage()).toBe('organ-red'); 
    expect(component.colorThiefColor()).toBeNull();
    expect(component.discardBackground()).toBe('var(--card-red)');
    
    // Host bindings
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.background).toBe('var(--card-red)');
    expect(hostEl.classList.contains('discard-preview--empty')).toBe(false);
    expect(hostEl.getAttribute('aria-label')).toBe('Última carta: c1. Total descartes: 3');
  });

  it('should work with colorThief treatment', () => {
    const card = { id: 'c2', kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefBlue, color: CardColor.Treatment } as Card;
    fixture.componentRef.setInput('topDiscard', card);
    fixture.componentRef.setInput('discardCount', 5);
    fixture.detectChanges();

    expect(component.colorThiefColor()).toBe('var(--card-blue)');
    expect(component.displayImage()).toBe('treatment-colorThief');
    expect(component.discardBackground()).toBe('var(--card-treatment)');
  });

  it('should gracefully handle undefined topDiscard when explicitly reading discardBackground', () => {
    fixture.componentRef.setInput('topDiscard', undefined);
    fixture.detectChanges();
    expect(component.discardBackground()).toBe('transparent');
  });
});

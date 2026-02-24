import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionMessageComponent } from './game-action-message.component';

describe('GameActionMessageComponent', () => {
  let component: GameActionMessageComponent;
  let fixture: ComponentFixture<GameActionMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameActionMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameActionMessageComponent);
    component = fixture.componentInstance;
  });

  it('should format contagion detail correctly', () => {
    fixture.componentRef.setInput('action', {
        type: 'play-card',
        detail: '→ contagió a Jugador 2'
    });
    fixture.detectChanges();
    expect(component.detail()).toBe('contra Jugador 2');
  });

  it('should return raw detail if not contagion', () => {
    fixture.componentRef.setInput('action', {
        type: 'play-card',
        detail: '→ sobre Jugador 3'
    });
    fixture.detectChanges();
    expect(component.detail()).toBe('→ sobre Jugador 3');
  });

  it('should return null detail if undefined', () => {
     fixture.componentRef.setInput('action', {
        type: 'play-card'
     });
     fixture.detectChanges();
     expect(component.detail()).toBeNull();
  });

  it('should format cards label correctly - 1 card', () => {
    fixture.componentRef.setInput('action', { type: 'discard', quantity: 1 });
    fixture.detectChanges();
    expect(component.cardsLabel()).toBe('1 carta');
  });

  it('should format cards label correctly - multiple', () => {
    fixture.componentRef.setInput('action', { type: 'discard', quantity: 3 });
    fixture.detectChanges();
    expect(component.cardsLabel()).toBe('3 cartas');
  });

  it('should format cards label correctly - default 0', () => {
    fixture.componentRef.setInput('action', { type: 'discard' });
    fixture.detectChanges();
    expect(component.cardsLabel()).toBe('0 cartas');
  });
});

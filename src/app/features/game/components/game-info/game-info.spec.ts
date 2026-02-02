import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicGameState } from '../../../../core/models/game.model';
import { GameInfoComponent } from './game-info';

const mockState: PublicGameState = {
  roomId: 'ABCDEF123456',
  discardCount: 2,
  deckCount: 40,
  players: [],
  startedAt: '2024-01-01T10:00:00.000Z',
  turnIndex: 0,
  turnDeadlineTs: Date.now(),
  remainingSeconds: 30,
  history: [],
};

describe('GameInfo', () => {
  let component: GameInfoComponent;
  let fixture: ComponentFixture<GameInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameInfoComponent);
    component = fixture.componentInstance;
    component.state = mockState;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('collapses details by default and toggles when clicking', () => {
    const host: HTMLElement = fixture.nativeElement.querySelector('.game-info');
    expect(host).withContext('host element should exist').not.toBeNull();

    expect(
      fixture.nativeElement.querySelector('.game-info__details')
    ).toBeNull();

    host.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.game-info__details')
    ).not.toBeNull();

    host.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.game-info__details')
    ).toBeNull();
  });

  it('emits when history button is pressed without toggling details', () => {
    const historySpy = jasmine.createSpy('historyRequested');
    component.historyRequested.subscribe(historySpy);
    component.historyCount = 3;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.history-toggle'
    );
    button.click();

    expect(historySpy).toHaveBeenCalled();
    expect(component.showDetails).toBeFalse();
  });

  it('muestra el tiempo jugado en su propia pila cuando se despliegan los detalles', () => {
    const host: HTMLElement = fixture.nativeElement.querySelector('.game-info');
    host.click();
    fixture.detectChanges();

    const durationPile: HTMLElement = fixture.nativeElement.querySelector(
      '.game-info__pile--duration'
    );
    expect(durationPile).withContext('debería existir la pila de duración').not.toBeNull();
    expect(durationPile.getAttribute('aria-label') || '').toContain('Tiempo jugado');

    const durationElement: HTMLElement =
      fixture.nativeElement.querySelector('.game-info__pile--duration .game-info__pile-count');
    expect(durationElement).withContext('debería mostrar la duración').not.toBeNull();
    expect(durationElement.textContent || '').toMatch(/^\d{2}:\d{2}$/);
  });
});

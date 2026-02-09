import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinnerComponent } from './game-winner';
import { TimerSoundService } from '@core/services/timer-sound.service';

class TimerSoundServiceStub {
  playWinner = jasmine.createSpy('playWinner');
}

describe('GameWinner', () => {
  let component: GameWinnerComponent;
  let fixture: ComponentFixture<GameWinnerComponent>;
  let timerSound: TimerSoundServiceStub;

  beforeEach(async () => {
    timerSound = new TimerSoundServiceStub();

    await TestBed.configureTestingModule({
      imports: [GameWinnerComponent],
      providers: [{ provide: TimerSoundService, useValue: timerSound }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameWinnerComponent);
    component = fixture.componentInstance;
    component.winner = {
      player: {
        id: 'player-1',
        name: 'Jugador 1',
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should play the winner sound when the winner changes', () => {
    expect(timerSound.playWinner).toHaveBeenCalled();
  });
});

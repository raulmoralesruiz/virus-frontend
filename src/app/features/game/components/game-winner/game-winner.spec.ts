import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinnerComponent } from './game-winner';
import { TimerSoundService } from '@core/services/timer-sound.service';

class TimerSoundServiceStub {
  playWinner = jest.fn();
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
    fixture.componentRef.setInput('winner', {
      player: {
        id: 'player-1',
        name: 'Jugador 1',
      },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should play the winner sound when the winner changes', () => {
    expect(timerSound.playWinner).toHaveBeenCalled();
  });

  it('should do nothing if winner is null', () => {
    timerSound.playWinner.mockClear();
    fixture.componentRef.setInput('winner', null);
    fixture.detectChanges();
    expect(timerSound.playWinner).not.toHaveBeenCalled();
  });

  it('should emit reset', () => {
    const spy = jest.spyOn(component.reset, 'emit');
    component.onReset();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit leave', () => {
    const spy = jest.spyOn(component.leave, 'emit');
    component.onLeave();
    expect(spy).toHaveBeenCalled();
  });

  it('should close modal', () => {
    component.isVisible = true;
    component.closeModal();
    expect(component.isVisible).toBe(false);
  });
});

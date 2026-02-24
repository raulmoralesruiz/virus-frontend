import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayerBoardHeaderComponent } from './player-board-header.component';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { signal } from '@angular/core';

describe('PlayerBoardHeaderComponent', () => {
  let component: PlayerBoardHeaderComponent;
  let fixture: ComponentFixture<PlayerBoardHeaderComponent>;
  let timerSoundServiceMock: any;

  beforeEach(async () => {
    timerSoundServiceMock = {
      isMuted: signal(false),
      playTurnStart: jest.fn(),
      playTick: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PlayerBoardHeaderComponent],
      providers: [
        { provide: TimerSoundService, useValue: timerSoundServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerBoardHeaderComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('player', {
      player: { id: 'p1', name: 'Player 1' },
      board: [],
      handCount: 3
    } as any);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('turnTimerState', () => {
    it('should be idle when inactive', () => {
      fixture.componentRef.setInput('isActive', false);
      expect(component.turnTimerState()).toBe('idle');
    });

    it('should be running when active and remaining > 10', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('remainingSeconds', 15);
      expect(component.turnTimerState()).toBe('running');
    });

    it('should be warning when active and remaining <= 10 and > 5', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('remainingSeconds', 8);
      expect(component.turnTimerState()).toBe('warning');
    });

    it('should be critical when active and remaining <= 5', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('remainingSeconds', 4);
      expect(component.turnTimerState()).toBe('critical');
    });
  });



  describe('sounds effect', () => {
    it('should not play anything if not me and active', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', false);
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTurnStart).not.toHaveBeenCalled();
    });

    it('should not play tracking tick if me but not active', () => {
      fixture.componentRef.setInput('isActive', false);
      fixture.componentRef.setInput('isMe', true);
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTick).not.toHaveBeenCalled();
    });

    it('should play turn start when becoming active and me', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', true);
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTurnStart).toHaveBeenCalled();
    });

    it('should not play tick if muted', () => {
      timerSoundServiceMock.isMuted.set(true);
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', true);
      fixture.componentRef.setInput('remainingSeconds', 8); // warning state
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTick).not.toHaveBeenCalled();
    });

    it('should play warning tick', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', true);
      fixture.componentRef.setInput('remainingSeconds', 8); // warning
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTick).toHaveBeenCalledWith('warning');
    });

    it('should play critical tick', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', true);
      fixture.componentRef.setInput('remainingSeconds', 3); // critical
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTick).toHaveBeenCalledWith('critical');
    });
    
    it('should not play tick on running state', () => {
      fixture.componentRef.setInput('isActive', true);
      fixture.componentRef.setInput('isMe', true);
      fixture.componentRef.setInput('remainingSeconds', 15); // running
      TestBed.flushEffects();
      expect(timerSoundServiceMock.playTick).not.toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerBoardHeaderComponent } from './player-board-header.component';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { GameStoreService } from '@core/services/game-store.service';
import { signal } from '@angular/core';

describe('PlayerBoardHeaderComponent', () => {
  let component: PlayerBoardHeaderComponent;
  let fixture: ComponentFixture<PlayerBoardHeaderComponent>;
  let timerSoundServiceMock: any;
  let gameStoreMock: { turnDurationSeconds: ReturnType<typeof signal> };

  beforeEach(async () => {
    timerSoundServiceMock = {
      isMuted: signal(false),
      playTurnStart: jest.fn(),
      playTick: jest.fn()
    };

    // Por defecto el store no conoce la duración: los tests de antes siguen
    // ejerciendo la heurística de respaldo (learnedDuration).
    gameStoreMock = { turnDurationSeconds: signal(0) };

    await TestBed.configureTestingModule({
      imports: [PlayerBoardHeaderComponent],
      providers: [
        { provide: TimerSoundService, useValue: timerSoundServiceMock },
        { provide: GameStoreService, useValue: gameStoreMock }
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

  describe('turnDurationSeconds', () => {
    it('should use the real duration from the store (F5 mid-turn case)', () => {
      gameStoreMock.turnDurationSeconds.set(60);
      fixture.componentRef.setInput('remainingSeconds', 30);
      // Con la heurística sola esto devolvía 30 (barra al 100%).
      expect(component.turnDurationSeconds()).toBe(60);
    });

    it('should fall back to the learned heuristic when the store has no duration', () => {
      gameStoreMock.turnDurationSeconds.set(0);
      fixture.componentRef.setInput('remainingSeconds', 45);
      // El efecto (setTimeout) aún no ha corrido; la heurística aprende luego.
      expect(component.turnDurationSeconds()).toBe(0);
    });

    it('should learn the duration via the heuristic after the effect fires (store sin duración)', () => {
      jest.useFakeTimers();
      gameStoreMock.turnDurationSeconds.set(0);
      fixture.componentRef.setInput('remainingSeconds', 45);
      TestBed.flushEffects();
      jest.runAllTimers();
      expect(component.turnDurationSeconds()).toBe(45);
      jest.useRealTimers();
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

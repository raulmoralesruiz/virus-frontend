import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameInfoComponent } from './game-info';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { ThemeService } from '@core/services/theme.service';
import { GameActionFeedService } from '../../game-action-feed/services/game-action-feed.service';
import { GameDurationService } from './services/game-duration.service';
import { GameFullscreenService } from './services/game-fullscreen.service';
import { signal } from '@angular/core';

describe('GameInfoComponent', () => {
  let component: GameInfoComponent;
  let fixture: ComponentFixture<GameInfoComponent>;

  const mockTimer = { isMuted: signal(false), toggleMute: jest.fn() };
  const mockTheme = { isDark: signal(false), toggleTheme: jest.fn() };
  const mockFeed = { currentAction: signal<any>(null) };
  const mockDuration = { gameDuration: signal(''), setupDurationTracking: jest.fn(), clearDurationTimer: jest.fn() };
  const mockFullscreen = { isFullscreenActive: signal(false), toggleFullscreen: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoComponent],
      providers: [
          { provide: TimerSoundService, useValue: mockTimer },
          { provide: ThemeService, useValue: mockTheme },
          { provide: GameActionFeedService, useValue: mockFeed },
          { provide: GameDurationService, useValue: mockDuration },
          { provide: GameFullscreenService, useValue: mockFullscreen }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameInfoComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
  });

  it('should create', () => {
      fixture.componentRef.setInput('state', {} as any);
      fixture.detectChanges();
      expect(component).toBeTruthy();
  });

  it('should track duration on changes', () => {
      fixture.componentRef.setInput('state', { startedAt: '2022-01-01', winner: true } as any);
      component.ngOnChanges({ state: {} as any });
      expect(mockDuration.setupDurationTracking).toHaveBeenCalledWith('2022-01-01', true);
  });

  it('should clear duration timer on destroy', () => {
      fixture.componentRef.setInput('state', {} as any);
      fixture.detectChanges();
      component.ngOnDestroy();
      expect(mockDuration.clearDurationTimer).toHaveBeenCalled();
  });

  describe('toggleDetails', () => {
      beforeEach(() => {
          fixture.componentRef.setInput('state', {} as any);
      });

      it('should not toggle if showing notification', () => {
          mockFeed.currentAction.set({ id: 'a1' });
          fixture.detectChanges();
          component.showDetails = false;
          component.toggleDetails();
          expect(component.showDetails).toBe(false);
      });

      it('should toggle if not showing notification', () => {
          mockFeed.currentAction.set(null);
          fixture.detectChanges();
          component.showDetails = false;
          component.toggleDetails();
          expect(component.showDetails).toBe(true);
      });
  });

  describe('events', () => {
      beforeEach(() => {
          fixture.componentRef.setInput('state', {} as any);
      });

      it('should request history', () => {
          jest.spyOn(component.historyRequested, 'emit');
          component.requestHistory();
          expect(component.historyRequested.emit).toHaveBeenCalled();
      });

      it('should request leave', () => {
           jest.spyOn(component.leaveRequested, 'emit');
           component.requestLeave();
           expect(component.leaveRequested.emit).toHaveBeenCalled();
      });

      it('should handle keyboard enter space', () => {
          mockFeed.currentAction.set(null);
          fixture.detectChanges();
          jest.spyOn(component, 'toggleDetails');
          
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          component.onKeyDown(enterEvent);
          expect(component.toggleDetails).toHaveBeenCalled();

          component.showDetails = true;
          const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
          component.onKeyDown(spaceEvent);
          expect(component.showDetails).toBe(false);

          // ignore other keys
          const aEvent = new KeyboardEvent('keydown', { key: 'a' });
          component.onKeyDown(aEvent);
          expect(component.showDetails).toBe(false); // not toggled
      });

      it('should handle keyboard early exit if notification', () => {
          mockFeed.currentAction.set({ id: 'a1' });
          fixture.detectChanges();
          jest.spyOn(component, 'toggleDetails');
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          component.onKeyDown(enterEvent);
          expect(component.toggleDetails).not.toHaveBeenCalled();
      });
  });

  describe('proxies', () => {
      beforeEach(() => {
          fixture.componentRef.setInput('state', {} as any);
      });

      it('should pass toggle calls', () => {
          component.toggleMute();
          expect(mockTimer.toggleMute).toHaveBeenCalled();

          component.toggleTheme();
          expect(mockTheme.toggleTheme).toHaveBeenCalled();

          component.toggleFullscreen();
          expect(mockFullscreen.toggleFullscreen).toHaveBeenCalled();
      });

      it('should slice room id correctly', () => {
          fixture.componentRef.setInput('state', { roomId: '123456789' } as any);
          fixture.detectChanges();
          expect(component.shortRoomId).toBe('123456');

          fixture.componentRef.setInput('state', null);
          fixture.detectChanges();
          expect(component.shortRoomId).toBe('');
      });
  });
});

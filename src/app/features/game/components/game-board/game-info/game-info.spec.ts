import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameInfoComponent } from './game-info';
import { GameInfoHeaderComponent } from './header/game-info-header';
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
    // Reset shared mocks so tests don't leak state into each other.
    mockFeed.currentAction.set(null);
    component.showDetails = false;
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

      it('debe conmutar al pulsar el <button> nativo (Enter/Espacio lo activan solos)', () => {
          mockFeed.currentAction.set(null);
          fixture.detectChanges();

          const toggle = fixture.nativeElement.querySelector('button.game-info-header__toggle') as HTMLButtonElement;
          expect(toggle.tagName).toBe('BUTTON');
          jest.spyOn(component, 'toggleDetails');

          toggle.click();
          expect(component.toggleDetails).toHaveBeenCalledTimes(1);

          toggle.click();
          expect(component.toggleDetails).toHaveBeenCalledTimes(2);
      });

      it('debe emitir toggleRequested por click sin manejadores de teclado manuales', () => {
          mockFeed.currentAction.set(null);
          fixture.detectChanges();

          const header = fixture.debugElement
            .query(By.directive(GameInfoHeaderComponent))
            .componentInstance;
          jest.spyOn(header.toggleRequested, 'emit');

          const toggle = fixture.nativeElement.querySelector('button.game-info-header__toggle') as HTMLButtonElement;
          toggle.click();
          toggle.click();

          expect(header.toggleRequested.emit).toHaveBeenCalledTimes(2);
          expect(header).not.toHaveProperty('onToggleKeydown');
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

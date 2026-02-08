import { Component, OnChanges, OnDestroy, SimpleChanges, computed, inject, input, output } from '@angular/core';
import { PublicGameState } from '../../../../../core/models/game.model';
import { TimerSoundService } from '../../../../../core/services/timer-sound.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { GameInfoHeaderComponent } from './header/game-info-header';
import { GameInfoDetailsComponent } from './details/game-info-details';
import { GameActionFeedComponent } from '../../game-action-feed/game-action-feed';
import { GameActionFeedService } from '../../game-action-feed/services/game-action-feed.service';
import { GameDurationService } from './services/game-duration.service';
import { GameFullscreenService } from './services/game-fullscreen.service';

@Component({
  selector: 'game-info',
  standalone: true,
  imports: [GameInfoHeaderComponent, GameInfoDetailsComponent, GameActionFeedComponent],
  templateUrl: './game-info.html',
  styleUrl: './game-info.css',
})
export class GameInfoComponent implements OnChanges, OnDestroy {
  state = input.required<PublicGameState>();
  historyCount = input(0);
  historyRequested = output<void>();
  leaveRequested = output<void>();

  showDetails = false;
  private readonly timerSoundService = inject(TimerSoundService);
  private readonly themeService = inject(ThemeService);
  private readonly actionFeedService = inject(GameActionFeedService);
  private readonly durationService = inject(GameDurationService);
  private readonly fullscreenService = inject(GameFullscreenService);

  readonly isMuted = this.timerSoundService.isMuted;
  readonly isDarkTheme = this.themeService.isDark;
  readonly isFullscreenActive = this.fullscreenService.isFullscreenActive;
  readonly gameDuration = this.durationService.gameDuration;
  
  readonly currentNotification = this.actionFeedService.currentAction;
  readonly isShowingNotification = computed(() => !!this.currentNotification());

  ngOnChanges(changes: SimpleChanges): void {
    if ('state' in changes) {
      const state = this.state();
      this.durationService.setupDurationTracking(state?.startedAt, !!state?.winner);
    }
  }

  ngOnDestroy(): void {
    this.durationService.clearDurationTimer();
  }

  toggleDetails(): void {
    if (this.isShowingNotification()) {
      return;
    }
    this.showDetails = !this.showDetails;
  }

  requestHistory(): void {
    this.historyRequested.emit();
  }

  requestLeave(): void {
    this.leaveRequested.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isShowingNotification()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDetails();
    }
  }

  toggleMute(): void {
    this.timerSoundService.toggleMute();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleFullscreen(): void {
    this.fullscreenService.toggleFullscreen();
  }

  get shortRoomId(): string {
    const state = this.state();
    return state?.roomId?.substring(0, 6) ?? '';
  }
}

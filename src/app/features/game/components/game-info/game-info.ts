import {
  Component,
  HostListener,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PublicGameState } from '../../../../core/models/game.model';
import { TimerSoundService } from '../../../../core/services/timer-sound.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { GameInfoHeaderComponent } from './header/game-info-header';
import { GameInfoDetailsComponent } from './details/game-info-details';
import { GameActionFeedComponent } from '../game-action-feed/game-action-feed';
import { GameActionFeedService } from '../game-action-feed/services/game-action-feed.service';

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
  private readonly documentRef = inject(DOCUMENT);
  private readonly actionFeedService = inject(GameActionFeedService);
  readonly isMuted = this.timerSoundService.isMuted;
  readonly isDarkTheme = this.themeService.isDark;
  isFullscreenActive = Boolean(this.documentRef.fullscreenElement);
  gameDuration = '';
  private startTimestamp?: number;
  private gameDurationTimer?: ReturnType<typeof setInterval>;
  readonly currentNotification = this.actionFeedService.currentAction;
  readonly isShowingNotification = computed(() => !!this.currentNotification());

  ngOnChanges(changes: SimpleChanges): void {
    if ('state' in changes) {
      this.setupDurationTracking();
    }
  }

  ngOnDestroy(): void {
    this.clearDurationTimer();
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

  async toggleFullscreen(): Promise<void> {
    try {
      if (this.documentRef.fullscreenElement) {
        await this.documentRef.exitFullscreen();
      } else {
        const element = this.documentRef.documentElement;
        if (element) {
          await element.requestFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen', error);
    } finally {
      this.isFullscreenActive = Boolean(this.documentRef.fullscreenElement);
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreenActive = Boolean(this.documentRef.fullscreenElement);
  }

  get shortRoomId(): string {
    const state = this.state();
    return state?.roomId?.substring(0, 6) ?? '';
  }

  private setupDurationTracking(): void {
    this.clearDurationTimer();

    const state = this.state();
    const startedAt = state?.startedAt;
    if (!startedAt) {
      this.startTimestamp = undefined;
      this.gameDuration = '';
      return;
    }

    const parsedStart = Date.parse(startedAt);
    if (Number.isNaN(parsedStart)) {
      this.startTimestamp = undefined;
      this.gameDuration = '';
      return;
    }

    this.startTimestamp = parsedStart;
    this.updateGameDuration();

    if (state?.winner) {
      return;
    }

    this.gameDurationTimer = setInterval(() => {
      this.updateGameDuration();
    }, 60000);
  }

  private clearDurationTimer(): void {
    if (this.gameDurationTimer) {
      clearInterval(this.gameDurationTimer);
      this.gameDurationTimer = undefined;
    }
  }

  private updateGameDuration(): void {
    if (!this.startTimestamp) {
      this.gameDuration = '';
      return;
    }

    const now = Date.now();
    const diffMs = Math.max(0, now - this.startTimestamp);
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    this.gameDuration = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}

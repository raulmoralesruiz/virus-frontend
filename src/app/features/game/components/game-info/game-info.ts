import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PublicGameState } from '../../../../core/models/game.model';
import { TimerSoundService } from '../../../../core/services/timer-sound.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { GameInfoHeaderComponent } from './header/game-info-header';
import { GameInfoDetailsComponent } from './details/game-info-details';

@Component({
  selector: 'game-info',
  standalone: true,
  imports: [GameInfoHeaderComponent, GameInfoDetailsComponent],
  templateUrl: './game-info.html',
  styleUrl: './game-info.css',
})
export class GameInfoComponent implements OnChanges, OnDestroy {
  @Input() state!: PublicGameState;
  @Input() historyCount = 0;
  @Output() historyRequested = new EventEmitter<void>();
  @Output() leaveRequested = new EventEmitter<void>();

  showDetails = false;
  private readonly timerSoundService = inject(TimerSoundService);
  private readonly themeService = inject(ThemeService);
  private readonly documentRef = inject(DOCUMENT);
  readonly isMuted = this.timerSoundService.isMuted;
  readonly isDarkTheme = this.themeService.isDark;
  isFullscreenActive = Boolean(this.documentRef.fullscreenElement);
  gameDuration = '';
  private startTimestamp?: number;
  private gameDurationTimer?: ReturnType<typeof setInterval>;

  ngOnChanges(changes: SimpleChanges): void {
    if ('state' in changes) {
      this.setupDurationTracking();
    }
  }

  ngOnDestroy(): void {
    this.clearDurationTimer();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  requestHistory(): void {
    this.historyRequested.emit();
  }

  requestLeave(): void {
    this.leaveRequested.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
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
    return this.state?.roomId?.substring(0, 6) ?? '';
  }

  private setupDurationTracking(): void {
    this.clearDurationTimer();

    const startedAt = this.state?.startedAt;
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

    if (this.state?.winner) {
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

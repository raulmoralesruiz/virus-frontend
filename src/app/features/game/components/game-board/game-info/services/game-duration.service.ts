import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameDurationService {
  readonly gameDuration = signal<string>('');
  private startTimestamp?: number;
  private gameDurationTimer?: ReturnType<typeof setInterval>;

  setupDurationTracking(startedAt?: string, hasWinner = false): void {
    this.clearDurationTimer();

    if (!startedAt) {
      this.startTimestamp = undefined;
      this.gameDuration.set('');
      return;
    }

    const parsedStart = Date.parse(startedAt);
    if (Number.isNaN(parsedStart)) {
      this.startTimestamp = undefined;
      this.gameDuration.set('');
      return;
    }

    this.startTimestamp = parsedStart;
    this.updateGameDuration();

    if (hasWinner) {
      return;
    }

    this.gameDurationTimer = setInterval(() => {
      this.updateGameDuration();
    }, 60000);
  }

  clearDurationTimer(): void {
    if (this.gameDurationTimer) {
      clearInterval(this.gameDurationTimer);
      this.gameDurationTimer = undefined;
    }
  }

  private updateGameDuration(): void {
    if (!this.startTimestamp) {
      this.gameDuration.set('');
      return;
    }

    const now = Date.now();
    const diffMs = Math.max(0, now - this.startTimestamp);
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    this.gameDuration.set(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`
    );
  }
}

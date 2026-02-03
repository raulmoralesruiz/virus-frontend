import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TimerSoundService } from '../../../../../../../core/services/timer-sound.service';
import { PublicPlayerInfo } from '../../../../../../../core/models/game.model';
import { CardIconComponent } from '../../../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'player-board-header',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './player-board-header.component.html',
  styleUrl: './player-board-header.component.css'
})
export class PlayerBoardHeaderComponent {
  player = input.required<PublicPlayerInfo>();
  isActive = input(false);
  isMe = input(false);
  remainingSeconds = input(0);

  private readonly timerSoundService = inject(TimerSoundService);

  turnTimerState = computed<'idle' | 'running' | 'warning' | 'critical'>(() => {
    if (!this.isActive()) return 'idle';

    const seconds = this.remainingSeconds();
    if (seconds <= 5) return 'critical';
    if (seconds <= 10) return 'warning';
    return 'running';
  });

  turnDurationSeconds = signal(0);

  turnProgressPercent = computed(() => {
    const duration = this.turnDurationSeconds();
    if (duration <= 0) return 0;

    const ratio = this.remainingSeconds() / duration;
    return Math.max(0, Math.min(100, ratio * 100));
  });

  isMuted = this.timerSoundService.isMuted;

  constructor() {
    effect(() => {
      const remaining = this.remainingSeconds();
      const currentDuration = this.turnDurationSeconds();

      if (remaining > currentDuration) {
        this.turnDurationSeconds.set(remaining);
      }
    });

    let wasActive = false;
    effect(() => {
      const isActive = this.isActive();
      const isMe = this.isMe();
      const seconds = this.remainingSeconds(); // fuerza ejecución cada segundo
      const timerState = this.turnTimerState();

      if (!isMe) {
        wasActive = false;
        return;
      }

      if (isActive && !wasActive) {
        this.timerSoundService.playTurnStart();
      }

      wasActive = isActive;

      if (!isActive) {
        return;
      }

      this.playTickForState(timerState);
    });
  }

  private playTickForState(
    timerState: 'idle' | 'running' | 'warning' | 'critical'
  ) {
    if (this.isMuted()) {
      return; // No hacer nada si está silenciado
    }

    switch (timerState) {
      case 'warning':
        this.timerSoundService.playTick('warning');
        break;
      case 'critical':
        this.timerSoundService.playTick('critical');
        break;
      default:
        break;
    }
  }
}

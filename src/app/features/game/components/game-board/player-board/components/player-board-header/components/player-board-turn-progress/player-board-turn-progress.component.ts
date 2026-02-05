import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'player-board-turn-progress',
  standalone: true,
  templateUrl: './player-board-turn-progress.component.html',
  styleUrl: './player-board-turn-progress.component.css',
})
export class PlayerBoardTurnProgressComponent {
  remainingSeconds = input(0);
  turnDurationSeconds = input(0);
  timerState = input<'idle' | 'running' | 'warning' | 'critical'>('idle');

  turnProgressPercent = computed(() => {
    const duration = this.turnDurationSeconds();
    if (duration <= 0) return 0;

    const ratio = this.remainingSeconds() / duration;
    return Math.max(0, Math.min(100, ratio * 100));
  });
}

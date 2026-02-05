import { Component, input } from '@angular/core';

@Component({
  selector: 'player-board-turn-timer',
  standalone: true,
  templateUrl: './player-board-turn-timer.component.html',
  styleUrl: './player-board-turn-timer.component.css',
})
export class PlayerBoardTurnTimerComponent {
  remainingSeconds = input(0);
  timerState = input<'idle' | 'running' | 'warning' | 'critical'>('idle');
}

import { Component, effect, computed, input, output, inject } from '@angular/core';
import { PublicPlayerInfo } from '@core/models/game.model';
import { TimerSoundService } from '@core/services/timer-sound.service';

@Component({
  selector: 'game-winner',
  standalone: true,
  imports: [],
  templateUrl: './game-winner.html',
  styleUrl: './game-winner.css',
})
export class GameWinnerComponent {
  private readonly timerSoundService = inject(TimerSoundService);

  winner = input<{ player: PublicPlayerInfo['player'] } | null>(null);
  readonly playerCount = input(0);
  reset = output<void>();
  leave = output<void>();

  isVisible = false;

  constructor() {
    effect(() => {
      const winner = this.winner();

      if (!winner) {
        return;
      }
      this.isVisible = true;
      this.timerSoundService.playWinner();
    });
  }

  onReset() {
    this.reset.emit();
  }

  onLeave() {
    this.leave.emit();
  }

  closeModal() {
    this.isVisible = false;
  }

  readonly canReset = computed(() => this.playerCount() >= 2);
}

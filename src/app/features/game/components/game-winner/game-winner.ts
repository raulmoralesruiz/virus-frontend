import { Component, effect, input, output, inject } from '@angular/core';
import { PublicPlayerInfo } from '../../../../core/models/game.model';
import { TimerSoundService } from '../../../../core/services/timer-sound.service';

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
  reset = output<void>();

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

  closeModal() {
    this.isVisible = false;
  }
}

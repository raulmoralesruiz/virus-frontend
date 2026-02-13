import { Component, effect, input, OnChanges, output, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PublicGameState } from '@core/models/game.model';

@Component({
  selector: 'game-turn',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './game-turn.html',
  styleUrl: './game-turn.css',
})
export class GameTurnComponent implements OnChanges {
  state = input.required<PublicGameState>();
  remainingSeconds = input.required<number>();
  isMyTurn = input(false);
  isGameEnded = input(false);

  // @Output() draw = new EventEmitter<void>();
  // @Output() endTurn = new EventEmitter<void>();

  timeoutExpired = output<void>();

  // 🚀 Signal wrapper para remainingSeconds (lo vamos a observar con effect)
  remaining = signal<number>(0);

  constructor() {
    // cuando cambia remaining -> comprobamos timeout
    effect(() => {
      const secs = this.remaining();
      const isMyTurn = this.isMyTurn();
      const isGameEnded = this.isGameEnded();
      if (secs === 0 && isMyTurn && !isGameEnded) {
        this.timeoutExpired.emit();
      }
    });
  }

  ngOnChanges() {
    // cada vez que Angular pase nuevas @Input
    this.remaining.set(this.remainingSeconds());
  }
}

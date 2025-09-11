import {
  Component,
  effect,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';

@Component({
  selector: 'game-turn',
  standalone: true,
  imports: [],
  templateUrl: './game-turn.html',
  styleUrl: './game-turn.css',
})
export class GameTurnComponent implements OnChanges {
  @Input() state!: PublicGameState;
  @Input() remainingSeconds!: number;
  @Input() isMyTurn!: boolean;
  @Input() isGameEnded!: boolean;

  // @Output() draw = new EventEmitter<void>();
  // @Output() endTurn = new EventEmitter<void>();

  @Output() timeoutExpired = new EventEmitter<void>();

  // 🚀 Signal wrapper para remainingSeconds (lo vamos a observar con effect)
  remaining = signal<number>(0);

  constructor() {
    // cuando cambia remaining -> comprobamos timeout
    effect(() => {
      const secs = this.remaining();
      if (secs === 0 && this.isMyTurn && !this.isGameEnded) {
        this.timeoutExpired.emit();
      }
    });
  }

  ngOnChanges() {
    // cada vez que Angular pase nuevas @Input
    this.remaining.set(this.remainingSeconds);
  }
}

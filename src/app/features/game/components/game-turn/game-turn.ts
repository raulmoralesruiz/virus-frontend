import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'game-turn',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './game-turn.html',
  styleUrl: './game-turn.css',
})
export class GameTurnComponent {
  @Input() state!: PublicGameState;
  @Input() remainingSeconds!: number;
  @Input() isMyTurn!: boolean;
  @Input() isGameEnded!: boolean;

  @Output() draw = new EventEmitter<void>();
  @Output() endTurn = new EventEmitter<void>();
}

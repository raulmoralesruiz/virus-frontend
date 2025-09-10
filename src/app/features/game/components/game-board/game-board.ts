import { Component, Input } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { PlayerBoard } from './player-board/player-board';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [PlayerBoard],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent {
  @Input() state!: PublicGameState;
}

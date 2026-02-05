import { Component, input } from '@angular/core';
import { PublicPlayerInfo } from '../../../../../../../../../core/models/game.model';

@Component({
  selector: 'player-board-empty',
  standalone: true,
  templateUrl: './player-board-empty.component.html',
  styleUrl: './player-board-empty.component.css',
})
export class PlayerBoardEmptyComponent {
  player = input.required<PublicPlayerInfo>();
}

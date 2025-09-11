import { Component, inject, Input } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { PlayerBoard } from './player-board/player-board';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [PlayerBoard],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent {
  @Input() state!: PublicGameState;

  private apiPlayer = inject(ApiPlayerService);

  get meId(): string | null {
    return this.apiPlayer.player()?.id ?? null;
  }
}

import { Component, inject, Input, ViewChild } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { PlayerBoardComponent } from './player-board/player-board';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameHandComponent } from '../game-hand/game-hand';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [PlayerBoardComponent],
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

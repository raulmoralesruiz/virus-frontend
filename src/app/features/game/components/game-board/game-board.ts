import { Component, computed, inject, input, output } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { PlayerBoardComponent } from './player-board/player-board';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { Card } from '../../../../core/models/card.model';
import { GameBoardTransplantComponent } from './game-board-transplant/game-board-transplant';
import { GameBoardContagionComponent } from './game-board-contagion/game-board-contagion';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [
    PlayerBoardComponent,
    GameBoardTransplantComponent,
    GameBoardContagionComponent,
  ],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  state = input.required<PublicGameState>();

  get meId(): string | null {
    return this._apiPlayer.player()?.id ?? null;
  }

  // lista con todos los ids de slots: slot-<playerId>-<color>
  allSlotIds = computed(() => {
    const st = this.state();
    if (!st) return [];

    const ids: string[] = [];
    for (const p of st.players) {
      // Solo generar IDs para huecos que realmente existen (tienen órgano)
      for (const organ of p.board) {
        ids.push(`slot-${p.player.id}-${organ.color}`);
      }
    }
    return ids;
  });

  startFailedExperiment = output<{
    card: Card;
    target: { organId: string; playerId: string };
  }>();

  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();
}

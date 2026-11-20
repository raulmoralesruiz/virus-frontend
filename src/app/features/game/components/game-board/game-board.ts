import { Component, computed, inject, input, output } from '@angular/core';
import { PublicGameState } from '@core/models/game.model';
import { PlayerBoardComponent } from './player-board/player-board';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { GameStoreService } from '@core/services/game-store.service';
import { Card } from '@core/models/card.model';
import { GameBoardTransplantComponent } from './game-board-transplant/game-board-transplant';
import { GameBoardContagionComponent } from './game-board-contagion/game-board-contagion';
import { GameInfoComponent } from './game-info/game-info';
import { DragDropService } from '@core/services/drag-drop.service';
import { BoardDragPredicates } from './player-board/logic/board-drag-predicates';
import { BoardActionService } from './player-board/services/board-action.service';
import { isValidDropTarget } from './player-board/player-card/player-card.validator';
import { TransplantState } from './player-board/player-board.models';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [
    PlayerBoardComponent,
    GameBoardTransplantComponent,
    GameBoardContagionComponent,
    GameInfoComponent,
  ],
  providers: [BoardActionService],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private _dragDrop = inject(DragDropService);
  private _predicates = inject(BoardDragPredicates);
  private _actionService = inject(BoardActionService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  state = input.required<PublicGameState>();
  historyCount = input(0);

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

  /**
   * Anuncio accesible (región aria-live) con el número de objetivos válidos
   * de la carta arrastrada o de la fase de selección del trasplante.
   */
  targetAnnouncement(transplantState: TransplantState | null): string {
    const st = this.state();
    if (!st) return '';

    // Fase de selección del segundo órgano del trasplante
    if (transplantState?.firstOrgan) {
      let n = 0;
      for (const p of st.players) {
        for (const organ of p.board) {
          if (
            this._actionService.isTransplantSecondTargetValid(
              organ,
              p.player.id,
              transplantState,
              st.players
            )
          ) {
            n++;
          }
        }
      }
      return n === 1
        ? '1 órgano válido para el trasplante.'
        : `${n} órganos válidos para el trasplante.`;
    }

    const dragged = this._dragDrop.draggedItem();
    if (!dragged) return '';

    const meId = this.meId;
    const countOrganTargets = () => {
      let n = 0;
      for (const p of st.players) {
        for (const organ of p.board) {
          if (isValidDropTarget(dragged, organ, p.player.id === meId)) n++;
        }
      }
      return n;
    };

    // Carta arrastrada desde la mano
    if ('kind' in dragged && dragged.kind !== 'virus-token') {
      const card = dragged as Card;
      let n: number;
      if (this._predicates.isBoardTargetCard(card)) {
        n = st.players.filter((p) =>
          this._predicates.isCardValidForBoard(card, p.player.id === meId, p.player.id)
        ).length;
        return n === 1 ? '1 tablero válido.' : `${n} tableros válidos.`;
      }
      if (this._predicates.isOrganTargetCard(card)) {
        n = countOrganTargets();
        return n === 1 ? '1 órgano válido.' : `${n} órganos válidos.`;
      }
      return '';
    }

    // Virus arrastrado desde otro órgano (Contagio)
    const n = countOrganTargets();
    return n === 1 ? '1 órgano válido para contagiar.' : `${n} órganos válidos para contagiar.`;
  }
}

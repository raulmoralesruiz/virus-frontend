import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';
import { Card, CardColor } from '@core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '@core/models/game.model';
import { isInfected, isVaccinated, isImmune } from '@core/utils/organ.utils';
import { FailedExperimentEvent, TransplantSelectionEvent, TransplantState } from '../player-board.models';

@Injectable()
export class BoardActionService {
  private _gameStore: GameStoreService = inject(GameStoreService);

  validateContagion(card: Card, isMe: boolean): boolean {
    if (!isMe) {
      this._gameStore.setClientError(
        'Solo puedes usar Contagio en tu propio turno.'
      );
      return false;
    }
    return true;
  }

  validateFailedExperiment(card: Card, color: CardColor, player: PublicPlayerInfo): FailedExperimentEvent | null {
    const organ = player.board.find((o: OrganOnBoard) => o.color === color);
    if (!organ) {
      this._gameStore.setClientError(
        'Debes soltar la carta sobre un órgano válido.'
      );
      return null;
    }

    if ((!isInfected(organ) && !isVaccinated(organ)) || isImmune(organ)) {
      this._gameStore.setClientError(
        'Solo puedes usar Experimento Fallido sobre órganos infectados o vacunados (no inmunes).'
      );
      return null;
    }

    return {
      card,
      target: { organId: organ.id, playerId: player.player.id },
    };
  }

  validateTransplantSelection(card: Card, color: CardColor, player: PublicPlayerInfo): TransplantSelectionEvent | null {
    const organ = player.board.find((o: OrganOnBoard) => o.color === color);
    if (!organ) {
      this._gameStore.setClientError(
        'Debes soltar el trasplante sobre un órgano válido.'
      );
      return null;
    }

    return {
      card,
      firstOrgan: { organId: organ.id, playerId: player.player.id },
    };
  }

  /**
   * ¿Es válido `candidate` como segundo órgano de un trasplante cuya primera
   * selección es `state.firstOrgan`? Refleja las reglas del backend
   * (transplant.service.ts):
   * - no es el mismo órgano que el primero;
   * - ninguno de los dos es inmune;
   * - el intercambio no deja dos órganos del mismo color en un jugador.
   */
  isTransplantSecondTargetValid(
    candidate: OrganOnBoard,
    candidatePlayerId: string,
    state: TransplantState,
    players: PublicPlayerInfo[]
  ): boolean {
    const first = state.firstOrgan;
    if (!first || candidate.id === first.organId) return false;

    const playerA = players.find((p) => p.player.id === first.playerId);
    const playerB = players.find((p) => p.player.id === candidatePlayerId);
    if (!playerA || !playerB) return false;

    const organA = playerA.board.find((o) => o.id === first.organId);
    if (!organA || isImmune(organA) || isImmune(candidate)) return false;

    // Tras el swap, ningún jugador puede tener dos órganos del mismo color
    if (playerA.board.some((o) => o.id !== organA.id && o.color === candidate.color)) return false;
    if (playerB.board.some((o) => o.id !== candidate.id && o.color === organA.color)) return false;

    return true;
  }

  validateSlotClick(
    organ: OrganOnBoard | undefined,
    playerId: string,
    transplantState: TransplantState | null,
    players: PublicPlayerInfo[]
  ): { organId: string; playerId: string } | null {
    if (!transplantState) return null;

    if (!organ) {
      this._gameStore.setClientError(
        'Debes seleccionar un órgano válido como segundo objetivo.'
      );
      return null;
    }

    if (!this.isTransplantSecondTargetValid(organ, playerId, transplantState, players)) {
      this._gameStore.setClientError(
        'Ese órgano no es un objetivo válido para el trasplante (inmune o duplicado de color).'
      );
      return null;
    }

    return { organId: organ.id, playerId };
  }
}

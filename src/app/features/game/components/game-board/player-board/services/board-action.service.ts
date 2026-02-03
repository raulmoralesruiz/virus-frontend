import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '../../../../../../core/services/game-store.service';
import { Card, CardColor } from '../../../../../../core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '../../../../../../core/models/game.model';
import { isInfected, isVaccinated, isImmune } from '../../../../../../core/utils/organ.utils';
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

  validateSlotClick(organ: OrganOnBoard | undefined, playerId: string, transplantState: TransplantState | null): { organId: string; playerId: string } | null {
    if (!transplantState) return null;

    if (!organ) {
      this._gameStore.setClientError(
        'Debes seleccionar un órgano válido como segundo objetivo.'
      );
      return null;
    }

    return { organId: organ.id, playerId };
  }
}

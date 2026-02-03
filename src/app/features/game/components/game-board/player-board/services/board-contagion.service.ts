import { Injectable, inject } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../../core/services/game-store.service';
import { Card, CardColor } from '../../../../../../core/models/card.model';
import { OrganOnBoard, PublicGameState, PublicPlayerInfo } from '../../../../../../core/models/game.model';

@Injectable()
export class BoardContagionService {
  private _gameStore: GameStoreService = inject(GameStoreService);

  validateVirusDrop(
    event: CdkDragDrop<any>,
    organ: OrganOnBoard,
    contagionState: any, // Typed in component
    isMe: boolean,
    currentPlayerId: string,
    hasTemporaryVirus: (organId: string, playerId: string) => boolean,
    gameState: PublicGameState
  ): { fromOrganId: string; toOrganId: string; toPlayerId: string; virus: Card } | null {
    const data = event.item.data; // { fromOrganId, virusId }
    if (!contagionState) return null;

    // 1. Evitar mismo órgano
    if (data.fromOrganId === organ.id) {
      this._gameStore.setClientError(
        'No puedes mover el virus al mismo órgano.'
      );
      return null;
    }

    // 2. Validar que es un órgano rival
    if (isMe) {
      this._gameStore.setClientError(
        'No puedes contagiar tus propios órganos.'
      );
      return null;
    }

    // 3. Verificar que el órgano destino está libre
    const hasAttached = organ.attached.some(
      (a: Card) => a.kind === 'virus' || a.kind === 'medicine'
    );

    const hasTemporary = hasTemporaryVirus(
      organ.id,
      currentPlayerId
    );

    if (hasAttached || hasTemporary) {
      this._gameStore.setClientError('El órgano destino no está libre.');
      return null;
    }

    // 4. Buscar el órgano origen y el virus
    let fromOrgan: OrganOnBoard | null = null;

    for (const player of gameState.players) {
      const foundOrgan = player.board.find(
        (o: any) => o.id === data.fromOrganId
      );
      if (foundOrgan) {
        fromOrgan = foundOrgan;
        break;
      }
    }

    if (!fromOrgan) {
      this._gameStore.setClientError('No se encontró el órgano origen.');
      return null;
    }

    const virus = fromOrgan.attached.find((a: Card) => a.id === data.virusId);

    if (!virus) {
      this._gameStore.setClientError('No se encontró el virus a mover.');
      return null;
    }

    // 5. Verificar compatibilidad de colores
    const isColorCompatible =
      virus.color === organ.color ||
      virus.color === CardColor.Multi ||
      organ.color === CardColor.Multi;

    if (!isColorCompatible) {
      this._gameStore.setClientError(
        `El virus ${virus.color} no es compatible con el órgano ${organ.color}.`
      );
      return null;
    }

    return {
      fromOrganId: data.fromOrganId,
      toOrganId: organ.id,
      toPlayerId: currentPlayerId,
      virus: virus,
    };
  }
}

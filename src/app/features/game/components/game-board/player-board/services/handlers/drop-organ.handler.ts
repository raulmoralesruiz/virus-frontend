import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '../../../../../../../core/services/game-store.service';
import { Card, CardColor } from '../../../../../../../core/models/card.model';
import { PublicPlayerInfo } from '../../../../../../../core/models/game.model';
import { describeOrgan, describeColor } from '../../../../../../../core/utils/card-label.utils';

@Injectable({ providedIn: 'root' })
export class DropOrganHandler {
  private _gameStore = inject(GameStoreService);

  handle(
    card: Card,
    rid: string,
    player: PublicPlayerInfo,
    isMe: boolean,
    slotColor?: CardColor
  ) {
    if (!isMe) {
        this._gameStore.setClientError(
          'Solo puedes poner órganos en tu propio tablero.'
        );
        return;
      }
  
      // Validación de color
      if (
        slotColor &&
        card.color !== slotColor &&
        card.color !== CardColor.Multi &&
        card.color !== CardColor.Orange
      ) {
        const organLabel = describeOrgan(card.color);
        const slotLabel = describeColor(slotColor);
        this._gameStore.setClientError(
          `El ${organLabel} no puede ocupar el hueco ${slotLabel}.`
        );
        return;
      }
  
      // Lógica de reemplazo para Órgano Mutante
      let target: any = undefined;
      if (card.color === CardColor.Orange && slotColor) {
        const existingOrgan = player.board.find((o) => o.color === slotColor);
        if (existingOrgan) {
          target = {
            organId: existingOrgan.id,
            playerId: player.player.id,
          };
        }
      }
  
      this._gameStore.playCard(rid, card.id, target);
  }
}

import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';
import { Card, CardColor } from '@core/models/card.model';
import { PublicPlayerInfo } from '@core/models/game.model';
import { 
  describeOrgan, 
  articleForCard, 
  describeCard, 
  cardWithArticle, 
  organWithArticle 
} from '@core/utils/card-label.utils';

@Injectable({ providedIn: 'root' })
export class DropMedicineHandler {
  private _gameStore = inject(GameStoreService);

  handle(
    card: Card,
    slotColor: CardColor,
    rid: string,
    player: PublicPlayerInfo
  ) {
    const organ = player.board.find((o) => o.color === slotColor);
    if (!organ) {
      const slotOrgan = describeOrgan(slotColor);
      const cardArticle = articleForCard(card).toLowerCase();
      const cardLabel = describeCard(card);
      this._gameStore.setClientError(
        `No hay un ${slotOrgan} disponible para aplicar ${cardArticle} ${cardLabel}.`
      );
      return;
    }

    if (
      card.color !== organ.color &&
      card.color !== CardColor.Multi &&
      organ.color !== CardColor.Multi
    ) {
      this._gameStore.setClientError(
        `${cardWithArticle(card)} no es compatible con ${organWithArticle(
          organ.color
        )}.`
      );
      return;
    }

    this._gameStore.playCard(rid, card.id, {
      organId: organ.id,
      playerId: player.player.id,
    });
  }
}

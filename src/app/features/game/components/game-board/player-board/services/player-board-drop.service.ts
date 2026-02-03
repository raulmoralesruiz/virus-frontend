import { Injectable, inject } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../../core/services/game-store.service';
import {
  Card,
  CardColor,
  CardKind,
} from '../../../../../../core/models/card.model';
import {
  PublicPlayerInfo,
} from '../../../../../../core/models/game.model';
import { DropOrganHandler } from './handlers/drop-organ.handler';
import { DropMedicineHandler } from './handlers/drop-medicine.handler';
import { DropTreatmentHandler } from './handlers/drop-treatment.handler';

@Injectable()
export class PlayerBoardDropService {
  private _gameStore = inject(GameStoreService);
  private _dropOrgan = inject(DropOrganHandler);
  private _dropMedicine = inject(DropMedicineHandler);
  private _dropTreatment = inject(DropTreatmentHandler);

  handleBoardDrop(event: CdkDragDrop<any>, roomId: string, player: PublicPlayerInfo, isMe: boolean) {
    const card = event.item.data as Card | undefined;
    if (!roomId || !card) return;

    switch (card.kind) {
      case CardKind.Organ:
        this._dropOrgan.handle(card, roomId, player, isMe);
        break;

      case CardKind.Treatment:
        this._dropTreatment.handleBoard(card, roomId, player, isMe);
        break;

      default:
        this._gameStore.setClientError(
          `No puedes soltar ${card.kind} en el tablero general.`
        );
        break;
    }
  }

  handleSlotDrop(
    event: CdkDragDrop<any>,
    roomId: string,
    player: PublicPlayerInfo,
    isMe: boolean,
    slotColor: CardColor
  ) {
    const card: Card = event.item.data;
    if (!roomId) return;

    switch (card.kind) {
      case CardKind.Organ:
        this._dropOrgan.handle(card, roomId, player, isMe, slotColor);
        break;

      case CardKind.Medicine:
      case CardKind.Virus:
        this._dropMedicine.handle(card, slotColor, roomId, player);
        break;

      case CardKind.Treatment:
        this._dropTreatment.handle(card, slotColor, roomId, player, isMe);
        break;

      default:
        this._gameStore.setClientError(
          `Tipo de carta no manejado por drag-and-drop: ${card.kind}`
        );
    }
  }
}

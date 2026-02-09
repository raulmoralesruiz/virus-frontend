import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { DropCommonTreatmentHandler } from './drop-common-treatment.handler';
import {
  Card,
  CardColor,
  TreatmentSubtype,
  CardKind
} from '@core/models/card.model';
import { PublicPlayerInfo } from '@core/models/game.model';


@Injectable({ providedIn: 'root' })
export class DropTreatmentHandler {
  private _gameStore = inject(GameStoreService);
  private _commonHandler = inject(DropCommonTreatmentHandler);

  handle(
    card: Card,
    slotColor: CardColor,
    rid: string,
    player: PublicPlayerInfo,
    isMe: boolean
  ) {
    switch (card.subtype) {
      case TreatmentSubtype.OrganThief:
        this._commonHandler.playOrganThief(card, slotColor, rid, player, isMe);
        break;

      case TreatmentSubtype.colorThiefRed:
        this._commonHandler.playColorThief(card, slotColor, CardColor.Red, rid, player, isMe);
        break;
      case TreatmentSubtype.colorThiefGreen:
         this._commonHandler.playColorThief(card, slotColor, CardColor.Green, rid, player, isMe);
        break;
      case TreatmentSubtype.colorThiefBlue:
         this._commonHandler.playColorThief(card, slotColor, CardColor.Blue, rid, player, isMe);
        break;
      case TreatmentSubtype.colorThiefYellow:
         this._commonHandler.playColorThief(card, slotColor, CardColor.Yellow, rid, player, isMe);
        break;

      case TreatmentSubtype.MedicalError:
        this._commonHandler.playMedicalError(card, rid, player);
        break;

      case TreatmentSubtype.Gloves:
         this._gameStore.playCard(rid, card.id);
         this._gameStore.setClientError('Has jugado Guantes de Látex.');
        break;

      case TreatmentSubtype.Contagion:
          // Initiates contagion mode (handled by component if triggered here, but usually component intercepts)
        break;

      case TreatmentSubtype.trickOrTreat:
        this._commonHandler.playTrickOrTreat(card, rid, player);
        break;
        
      case TreatmentSubtype.Transplant:
      case TreatmentSubtype.AlienTransplant:
      case TreatmentSubtype.failedExperiment:
         // These need to trigger mode changes in the component
         break;

      default:
        this._gameStore.setClientError(
          `Tratamiento ${card.subtype} aún no implementado por drag-and-drop`
        );
    }
  }

  handleBoard(
    card: Card,
    rid: string,
    player: PublicPlayerInfo,
    isMe: boolean
  ) {
      switch (card.subtype) {
          case TreatmentSubtype.Gloves:
              this._gameStore.playCard(rid, card.id);
              this._gameStore.setClientError('Has jugado Guantes de Látex.');
              break;
              
          case TreatmentSubtype.MedicalError:
              this._commonHandler.playMedicalError(card, rid, player);
              break;
              
          case TreatmentSubtype.trickOrTreat:
              this._commonHandler.playTrickOrTreat(card, rid, player);
              break;
              
          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
          case TreatmentSubtype.Contagion:
               // Handled by component usually
               break;

          default:
              this._gameStore.setClientError(
                  `Tratamiento ${card.subtype} no válido en el tablero general.`
              );
      }
  }
}

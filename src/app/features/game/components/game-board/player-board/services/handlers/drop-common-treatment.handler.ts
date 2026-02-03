import { Injectable, inject } from '@angular/core';
import { GameStoreService } from '../../../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../../../core/services/api/api.player.service';
import { Card, CardColor } from '../../../../../../../core/models/card.model';
import { PublicPlayerInfo, MedicalErrorTarget } from '../../../../../../../core/models/game.model';

@Injectable({ providedIn: 'root' })
export class DropCommonTreatmentHandler {
    private _gameStore = inject(GameStoreService);
    private _apiPlayer = inject(ApiPlayerService);

    playOrganThief(card: Card, slotColor: CardColor, rid: string, player: PublicPlayerInfo, isMe: boolean) {
        const organ = player.board.find(o => o.color === slotColor);
   
       if (isMe) {
         this._gameStore.setClientError('No puedes robarte a ti mismo.');
         return;
       }
   
       if (!organ) {
         this._gameStore.setClientError(
           `No hay órgano en hueco ${slotColor} para aplicar ${card.kind}`
         );
         return;
       }
   
       this._gameStore.playCard(rid, card.id, {
         organId: organ.id,
         playerId: player.player.id,
       });
     }
   
     playColorThief(card: Card, slotColor: CardColor, requiredColor: CardColor, rid: string, player: PublicPlayerInfo, isMe: boolean) {
       const organ = player.board.find(o => o.color === slotColor);
   
       if (isMe) {
         this._gameStore.setClientError('No puedes robarte a ti mismo.');
         return;
       }
   
       if (!organ) {
         this._gameStore.setClientError(
           `No hay órgano en hueco ${slotColor} para aplicar ${card.kind}`
         );
         return;
       }
   
       if (organ.color !== requiredColor) {
          this._gameStore.setClientError(
           `No coincide el color del órgano`
         );
         return;
       }
   
       this._gameStore.playCard(rid, card.id, {
         organId: organ.id,
         playerId: player.player.id,
       });
     }
   
     playMedicalError(card: Card, rid: string, player: PublicPlayerInfo) {
       const me = this._apiPlayer.player();
       const targetId = player.player.id;
   
       if (!me) return;
   
       if (targetId === me.id) {
         this._gameStore.setClientError(
           'No puedes jugar Error Médico sobre ti mismo.'
         );
         return;
       }
   
       this._gameStore.playCard(rid, card.id, {
         playerId: targetId,
       } as MedicalErrorTarget);
     }
   
     playTrickOrTreat(card: Card, rid: string, player: PublicPlayerInfo) {
       const me = this._apiPlayer.player();
       const targetId = player.player.id;
   
       if (!me) return;
   
       if (targetId === me.id) {
         this._gameStore.setClientError('No puedes jugar Truco o Trato sobre ti mismo.');
         return;
       }
   
       this._gameStore.playCard(rid, card.id, {
         playerId: targetId,
       } as MedicalErrorTarget);
     }
}

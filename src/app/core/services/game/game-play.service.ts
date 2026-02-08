import { Injectable, inject } from '@angular/core';
import { SocketGameService } from '../../services/socket/socket.game.service';
import { ApiPlayerService } from '../api/api.player.service';
import { AnyPlayTarget } from '../../models/game-actions.model';

@Injectable({ providedIn: 'root' })
export class GamePlayService {
  private socketGame = inject(SocketGameService);
  private apiPlayer = inject(ApiPlayerService);

  private hand = this.socketGame.hand;

  playCard(roomId: string, cardId: string, target?: AnyPlayTarget) {
    const me = this.apiPlayer.player();
    if (!me) {
      console.warn('[GamePlay] No player identificado');
      return;
    }

    console.log(`[GamePlay] se va a jugar la carta ${cardId}`);

    this.socketGame.playCard({
      roomId,
      playerId: me.id,
      cardId,
      target,
    });
  }

  discardCards(roomId: string, cardIds: string[]) {
    const me = this.apiPlayer.player();
    if (!me) return;

    this.socketGame.discardCards({
      roomId,
      playerId: me.id,
      cardIds,
    });
  }

  handleTurnTimeout(roomId: string) {
    const hand = this.hand();
    if (!hand.length) return;
    const randomIdx = Math.floor(Math.random() * hand.length);
    const randomCard = hand[randomIdx];
    this.discardCards(roomId, [randomCard.id]);
  }
}

import { Injectable, inject } from '@angular/core';
import { SocketService } from '../socket.service';
import { GAME_CONSTANTS } from '../../../constants/game.constants';
import { DiscardCardsPayload, PlayCardPayload } from '../../../models/game.model';

@Injectable({ providedIn: 'root' })
export class SocketGameActionService {
  private socketService = inject(SocketService);

  startGame(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.GAME_START, { roomId });
  }

  requestGameState(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.GAME_GET_STATE, { roomId });
  }

  drawCard(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.GAME_DRAW, { roomId });
  }

  endTurn(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.GAME_END_TURN, { roomId });
  }

  playCard(payload: PlayCardPayload) {
    this.socketService.emit(GAME_CONSTANTS.GAME_PLAY_CARD, payload);
  }

  discardCards(payload: DiscardCardsPayload) {
    this.socketService.emit(GAME_CONSTANTS.GAME_DISCARD, payload);
  }

  resetRoom(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.ROOM_RESET, { roomId });
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { SocketService } from './socket.service';
import { GAME_CONSTANTS } from '../../constants/game.constants';
import { Card } from '../../models/card.model';
import { PublicGameState } from '../../models/game.model';

@Injectable({ providedIn: 'root' })
export class SocketGameService {
  private socketService = inject(SocketService);

  publicState = signal<PublicGameState | null>(null);
  hand = signal<Card[]>([]);

  constructor() {
    this.registerListeners();
  }

  private registerListeners() {
    this.socketService.on(
      GAME_CONSTANTS.GAME_STARTED,
      (state: PublicGameState) => {
        console.log('[SocketGameService] GAME_STARTED', state);
        this.publicState.set(state);
      }
    );

    this.socketService.on(
      GAME_CONSTANTS.GAME_HAND,
      (data: { roomId: string; playerId: string; hand: Card[] }) => {
        console.log('[SocketGameService] GAME_HAND', data);
        this.hand.set(data.hand);
      }
    );

    this.socketService.on(
      GAME_CONSTANTS.GAME_STATE,
      (state: PublicGameState) => {
        console.log('[SocketGameService] GAME_STATE', state);
        this.publicState.set(state);
      }
    );
  }

  startGame(roomId: string) {
    console.log(
      `[SocketGameService] Emitting ${GAME_CONSTANTS.GAME_START}`,
      roomId
    );
    this.socketService.emit(GAME_CONSTANTS.GAME_START, { roomId });
  }

  requestGameState(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.GAME_GET_STATE, { roomId });
  }
}

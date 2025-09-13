import { Injectable, signal, inject } from '@angular/core';
import { SocketService } from './socket.service';
import { GAME_CONSTANTS } from '../../constants/game.constants';
import { Card } from '../../models/card.model';
import {
  AnyPlayTarget,
  PublicGameState,
  PublicPlayerInfo,
} from '../../models/game.model';
import { ApiPlayerService } from '../api/api.player.service';

@Injectable({ providedIn: 'root' })
export class SocketGameService {
  private socketService = inject(SocketService);
  private apiPlayerService = inject(ApiPlayerService);

  publicState = signal<PublicGameState | null>(null);
  hand = signal<Card[]>([]);
  lastError = signal<string | null>(null);
  winner = signal<PublicPlayerInfo | null>(null);

  ERROR_TIMEOUT: number = 3000;

  constructor() {
    this.registerListeners();
  }

  private registerListeners() {
    // 🔔 Partida iniciada
    this.socketService.on(
      GAME_CONSTANTS.GAME_STARTED,
      (state: PublicGameState) => {
        console.log('[SocketGameService] GAME_STARTED', state);
        this.publicState.set(state);
        this.winner.set(null); // limpiar ganador de partida anterior
      }
    );

    // 🃏 Mano privada
    this.socketService.on(
      GAME_CONSTANTS.GAME_HAND,
      (data: { roomId: string; playerId: string; hand: Card[] }) => {
        console.log('[SocketGameService] GAME_HAND', data);
        // this.hand.set(data.hand);
        const myId = this.apiPlayerService.player()?.id;
        if (myId && data.playerId === myId) {
          console.log('[SocketGameService] ✅ Actualizando mi mano', data.hand);
          this.hand.set(data.hand);
        } else {
          console.log('[SocketGameService] ❌ Ignorando mano que no es mía');
        }
      }
    );

    // 🔄 Estado público en cualquier momento
    this.socketService.on(
      GAME_CONSTANTS.GAME_STATE,
      (state: PublicGameState) => {
        // console.log('[SocketGameService] GAME_STATE', state);
        this.publicState.set(state);
      }
    );

    // Mostrar posibles errores
    this.socketService.on(
      GAME_CONSTANTS.GAME_ERROR,
      (err: { code: string; message: string }) => {
        console.warn(
          `[SocketGameService] GAME_ERROR ${err.code} - ${err.message}`
        );
        this.lastError.set(err.message ?? 'Error desconocido'); // seguimos mostrando solo el mensaje al usuario

        // Limpia el error tras unos segundos
        setTimeout(() => this.lastError.set(null), this.ERROR_TIMEOUT);
      }
    );

    // 🏆 detectar fin de partida
    this.socketService.on(
      GAME_CONSTANTS.GAME_END,
      (data: { roomId: string; winner: PublicPlayerInfo }) => {
        this.winner.set(data.winner);
        console.log('🏆 Partida terminada, ganador:', data.winner);
      }
    );

    this.socketService.on(
      GAME_CONSTANTS.ROOM_RESET,
      (data: { roomId: string }) => {
        console.log('[SocketGameService] ROOM_RESET', data);
        this.publicState.set(null);
        this.hand.set([]);
        this.winner.set(null);
      }
    );
  }

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

  playCard(payload: {
    roomId: string;
    playerId: string;
    cardId: string;
    target?: AnyPlayTarget;
  }) {
    this.socketService.emit(GAME_CONSTANTS.GAME_PLAY_CARD, payload);
  }

  discardCards(payload: {
    roomId: string;
    playerId: string;
    cardIds: string[];
  }) {
    this.socketService.emit(GAME_CONSTANTS.GAME_DISCARD, payload);
  }

  resetRoom(roomId: string) {
    this.socketService.emit(GAME_CONSTANTS.ROOM_RESET, { roomId });
    this.winner.set(null);
    this.publicState.set(null);
    this.hand.set([]);
  }

  setClientError(msg: string) {
    this.lastError.set(msg);
    setTimeout(() => this.lastError.set(null), this.ERROR_TIMEOUT);
  }
}

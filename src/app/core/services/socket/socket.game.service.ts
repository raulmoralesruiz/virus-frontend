import { Injectable, inject } from '@angular/core';
import { SocketGameStateService } from './game/socket.game.state.service';
import { SocketGameActionService } from './game/socket.game.action.service';
import { SocketGameListenerService } from './game/socket.game.listener.service';
import {
  BaseGamePayload,
  DiscardCardsPayload,
  PlayCardPayload,
} from '../../models/game.model';

@Injectable({ providedIn: 'root' })
export class SocketGameService {
  private state = inject(SocketGameStateService);
  private actions = inject(SocketGameActionService);
  private listeners = inject(SocketGameListenerService); // Inject to ensure initialization

  // Signals (Events from State)
  publicState = this.state.publicState;
  hand = this.state.hand;
  lastError = this.state.lastError;
  winner = this.state.winner;

  // Actions (Events to Socket)
  startGame(roomId: string) {
    this.actions.startGame(roomId);
  }

  requestGameState(roomId: string) {
    this.actions.requestGameState(roomId);
  }

  drawCard(roomId: string) {
    this.actions.drawCard(roomId);
  }

  endTurn(roomId: string) {
    this.actions.endTurn(roomId);
  }

  playCard(payload: PlayCardPayload) {
    this.actions.playCard(payload);
  }

  discardCards(payload: DiscardCardsPayload) {
    this.actions.discardCards(payload);
  }

  resetRoom(roomId: string) {
    this.actions.resetRoom(roomId);
    this.state.reset();
  }

  // Local State Management
  clearLastError() {
    this.state.setLastError(null);
  }

  setClientError(msg: string) {
    this.state.setLastError(msg);
  }

  leaveGame(roomId?: string) {
    if (!roomId || this.state.activeRoomId === roomId) {
      this.state.reset();
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { Card } from '../../../models/card.model';
import { PublicGameState, PublicPlayerInfo } from '../../../models/game.model';

@Injectable({ providedIn: 'root' })
export class SocketGameStateService {
  publicState = signal<PublicGameState | null>(null);
  hand = signal<Card[]>([]);
  lastError = signal<string | null>(null);
  winner = signal<PublicPlayerInfo | null>(null);
  activeRoomId: string | null = null;
  readonly ERROR_TIMEOUT = 5000;

  setActiveRoomId(roomId: string | null) {
    this.activeRoomId = roomId;
  }

  setPublicState(state: PublicGameState | null) {
    this.publicState.set(state);
  }

  setHand(hand: Card[]) {
    this.hand.set(hand);
  }

  setWinner(winner: PublicPlayerInfo | null) {
    this.winner.set(winner);
  }

  setLastError(message: string | null) {
    this.lastError.set(message);
    if (message) {
      setTimeout(() => this.lastError.set(null), this.ERROR_TIMEOUT);
    }
  }

  reset() {
    this.publicState.set(null);
    this.hand.set([]);
    this.winner.set(null);
    this.lastError.set(null);
    this.activeRoomId = null;
  }
}

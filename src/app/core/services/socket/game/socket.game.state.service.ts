import { Injectable, signal } from '@angular/core';
import { Card } from '../../../models/card.model';
import { EmoteEvent, PublicGameState, PublicPlayerInfo } from '../../../models/game.model';

const nextEmoteId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `em-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

@Injectable({ providedIn: 'root' })
export class SocketGameStateService {
  publicState = signal<PublicGameState | null>(null);
  hand = signal<Card[]>([]);
  lastError = signal<string | null>(null);
  winner = signal<PublicPlayerInfo | null>(null);
  emotes = signal<EmoteEvent[]>([]);
  activeRoomId: string | null = null;
  readonly ERROR_TIMEOUT = 5000;
  /** Cuánto tiempo vive una burbuja de emote en pantalla antes de desaparecer. */
  readonly EMOTE_TTL_MS = 3500;
  private readonly emoteTimers = new Map<string, ReturnType<typeof setTimeout>>();

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

  /**
   * Alta de un emote recibido (o emitido): queda en la lista y expira solo a
   * los EMOTE_TTL_MS. Devuelve el evento completo con su id asignado.
   */
  addEmote(event: Omit<EmoteEvent, 'id'>): EmoteEvent {
    const full: EmoteEvent = { ...event, id: nextEmoteId() };
    this.emotes.update((list) => [...list, full]);
    this.emoteTimers.set(
      full.id,
      setTimeout(() => this.removeEmote(full.id), this.EMOTE_TTL_MS)
    );
    return full;
  }

  removeEmote(id: string) {
    const timer = this.emoteTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.emoteTimers.delete(id);
    }
    this.emotes.update((list) => list.filter((e) => e.id !== id));
  }

  clearEmotes() {
    for (const timer of this.emoteTimers.values()) clearTimeout(timer);
    this.emoteTimers.clear();
    this.emotes.set([]);
  }

  reset() {
    this.publicState.set(null);
    this.hand.set([]);
    this.winner.set(null);
    this.lastError.set(null);
    this.clearEmotes();
    this.activeRoomId = null;
  }
}

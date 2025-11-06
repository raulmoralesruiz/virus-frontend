import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SocketGameService } from '../services/socket/socket.game.service';
import { Router } from '@angular/router';
import { ApiPlayerService } from './api/api.player.service';
import { AnyPlayTarget } from '../models/game.model';
import { RoomStoreService } from './room-store.service';

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  private socketGame = inject(SocketGameService);
  private apiPlayer = inject(ApiPlayerService);
  private router = inject(Router);
  private roomStore = inject(RoomStoreService);

  // Estado público de la partida (mazo, descarte, jugadores...)
  publicState = this.socketGame.publicState;
  // Mano privada del jugador
  hand = this.socketGame.hand;
  // Info sobre errores
  lastError = this.socketGame.lastError;

  // ¿Soy el jugador activo?
  isMyTurn = computed(() => {
    const state = this.publicState();
    const me = this.apiPlayer.player();
    if (!state || !me) return false;
    const idx = state.turnIndex;
    const activePlayerId = state.players[idx]?.player.id;
    return activePlayerId === me.id;
  });

  remainingSeconds = computed(() => {
    const state = this.publicState();
    return state?.remainingSeconds ?? 0;
  });

  winner = this.socketGame.winner;
  history = computed(() => this.publicState()?.history ?? []);
  private historyVisible = signal(false);
  historyOpen = this.historyVisible.asReadonly();

  constructor() {
    effect(() => {
      const state = this.publicState();
      if (!state) return;

      const player = this.apiPlayer.player();
      if (!player) return;

      const isPlayerInGame = state.players.some(
        (info) => info.player.id === player.id
      );

      if (!isPlayerInGame) {
        if (this.router.url.startsWith('/game/')) {
          this.router.navigate(['/room-list']);
        }
        return;
      }

      const targetUrl = `/game/${state.roomId}`;
      if (!this.router.url.startsWith(targetUrl)) {
        this.router.navigate(['/game', state.roomId]);
      }
    });
  }

  /**
   * Inicia la partida en una sala concreta
   */
  startGame(roomId: string) {
    this.socketGame.startGame(roomId);
  }

  /**
   * Solicita el estado actual de la partida (mazo, descarte, jugadores...)
   */
  getState(roomId: string) {
    this.socketGame.requestGameState(roomId);
  }

  drawCard(roomId: string) {
    this.socketGame.drawCard(roomId);
  }

  endTurn(roomId: string) {
    this.socketGame.endTurn(roomId);
  }

  // admitir target tipo ContagionTarget
  playCard(
    roomId: string,
    cardId: string,
    target?: AnyPlayTarget
    // target?: { playerId: string; organId: string }
  ) {
    const me = this.apiPlayer.player();
    if (!me) {
      console.warn('[GameStore] No player identificado');
      return;
    }

    console.log(`GS! se va a jugar la carta ${cardId}`);

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

  resetRoom(roomId: string) {
    this.socketGame.resetRoom(roomId);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  leaveGame(roomId: string) {
    const player = this.apiPlayer.player();
    if (!player) return;

    this.socketGame.leaveGame(roomId);
    this.roomStore.leaveRoom(roomId, player);
    this.historyVisible.set(false);
    this.router.navigate(['/room-list']);
  }

  setClientError(msg: string) {
    this.socketGame.setClientError(msg);
  }

  clearError() {
    this.socketGame.clearLastError();
  }

  openHistoryModal() {
    this.historyVisible.set(true);
  }

  closeHistoryModal() {
    this.historyVisible.set(false);
  }
}

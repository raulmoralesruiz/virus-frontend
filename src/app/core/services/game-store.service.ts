import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SocketGameService } from '../services/socket/socket.game.service';
import { Router } from '@angular/router';
import { ApiPlayerService } from './api/api.player.service';
import { AnyPlayTarget } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  private socketGame = inject(SocketGameService);
  private apiPlayer = inject(ApiPlayerService);
  private router = inject(Router);

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

  // reloj reactivo (1s)
  private tick = signal(Date.now());
  now = computed(() => this.tick());

  remainingSeconds = computed(() => {
    const state = this.publicState();
    if (!state) return 0;
    const leftMs = state.turnDeadlineTs - this.now();
    return Math.max(0, Math.ceil(leftMs / 1000));
  });

  winner = this.socketGame.winner;

  constructor() {
    effect(() => {
      const state = this.publicState();
      if (state) {
        this.router.navigate(['/game', state.roomId]);
      }
    });

    // 🔔 Intervalo que actualiza tick cada segundo
    setInterval(() => {
      this.tick.set(Date.now());
    }, 1000);
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
}

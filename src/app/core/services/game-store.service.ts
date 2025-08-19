import { Injectable, effect, inject } from '@angular/core';
import { SocketGameService } from '../services/socket/socket.game.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  private socketGame = inject(SocketGameService);
  private router = inject(Router);

  // Estado público de la partida (mazo, descarte, jugadores...)
  publicState = this.socketGame.publicState;

  // Mano privada del jugador
  hand = this.socketGame.hand;

  constructor() {
    effect(() => {
      const state = this.publicState();
      if (state) {
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
}

import { Injectable, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocketGameService } from '../../services/socket/socket.game.service';
import { ApiPlayerService } from '../api/api.player.service';

@Injectable({ providedIn: 'root' })
export class GameNavigationService {
  private router = inject(Router);
  private socketGame = inject(SocketGameService);
  private apiPlayer = inject(ApiPlayerService);

  private publicState = this.socketGame.publicState;

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

  goHome() {
    this.router.navigate(['/home']);
  }

  goToRoomList() {
    this.router.navigate(['/room-list']);
  }
}

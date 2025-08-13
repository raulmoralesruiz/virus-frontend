import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';
import { SocketService } from './socket.service';
import { PLAYER_CONSTANTS } from '../constants/player.constants';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  player = signal<Player | null>(null);

  constructor(private socketService: SocketService) {}

  createPlayer(name: string) {
    this.socketService.emit(PLAYER_CONSTANTS.PLAYER_NEW, name);

    this.socketService.on(PLAYER_CONSTANTS.PLAYER_CREATED, (player: Player) => {
      this.player.set(player);
      localStorage.setItem('player', JSON.stringify(player));
      // onCreated?.();
    });

    // this.player.set({
    //   id: crypto.randomUUID(),
    //   name,
    // });
  }

  loadPlayerFromStorage() {
    const stored = localStorage.getItem('player');
    if (stored) {
      this.player.set(JSON.parse(stored));
    }
  }
}

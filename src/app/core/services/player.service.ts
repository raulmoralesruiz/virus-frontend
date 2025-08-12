import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  player = signal<Player | null>(null);

  setPlayer(name: string) {
    this.player.set({
      id: crypto.randomUUID(),
      name,
    });
  }
}

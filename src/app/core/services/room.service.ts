import { Injectable, signal } from '@angular/core';
import { Player } from '../models/player.model';
import { Room } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  rooms = signal<Room[]>([]);
  currentRoom = signal<Room | null>(null);

  createRoom(name: string, creator: Player) {
    const room: Room = {
      id: crypto.randomUUID(),
      name,
      players: [creator],
    };
    this.rooms.update((r) => [...r, room]);
    this.currentRoom.set(room);
  }

  joinRoom(roomId: string, player: Player) {
    this.rooms.update((r) =>
      r.map((room) =>
        room.id === roomId
          ? { ...room, players: [...room.players, player] }
          : room
      )
    );
    this.currentRoom.set(this.rooms().find((r) => r.id === roomId) || null);
  }
}

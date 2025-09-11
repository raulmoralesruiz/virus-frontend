// src/app/core/services/room-store.service.ts
import { Injectable, effect, inject, signal } from '@angular/core';
import { Room } from '../models/room.model';
import { Player } from '../models/player.model';
import { ApiRoomService } from './api/api.room.service';
import { SocketRoomService } from './socket/socket.room.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoomStoreService {
  private api = inject(ApiRoomService);
  private socket = inject(SocketRoomService);
  private router = inject(Router);

  rooms = signal<Room[]>([]);
  currentRoom = signal<Room | null>(null);

  constructor() {
    this.listenSocketUpdates();

    effect(() => {
      const room = this.currentRoom();
      if (room) {
        this.router.navigate(['/room', room.id]);
      }
    });
  }

  private listenSocketUpdates() {
    this.socket.onRoomsList((rooms) => this.rooms.set(rooms));
    this.socket.onRoomJoined((room) => {
      this.currentRoom.set(room);
      this.api.setCurrentRoom(room); // persistencia local
    });
  }

  getRooms() {
    // 1️⃣ Cargar desde API
    this.api.getRoomList();
    this.rooms.set(this.api.roomList());

    // 2️⃣ Pedir lista actualizada por WS
    this.socket.requestRoomsList();
  }

  loadRoomById(id: string) {
    this.api.getRoomById(id).subscribe((room) => {
      this.currentRoom.set(room);
    });
  }

  createRoom(player: Player) {
    this.socket.createRoom(player);
  }

  joinRoom(roomId: string, player: Player) {
    this.socket.joinRoom(roomId, player);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}

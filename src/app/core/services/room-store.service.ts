// src/app/core/services/room-store.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Room } from '../models/room.model';
import { Player } from '../models/player.model';
import { ApiRoomService } from './api/api.room.service';
import { SocketRoomService } from './socket/socket.room.service';

@Injectable({ providedIn: 'root' })
export class RoomStoreService {
  private api = inject(ApiRoomService);
  private socket = inject(SocketRoomService);

  rooms = signal<Room[]>([]);
  currentRoom = signal<Room | null>(null);

  constructor() {
    this.listenSocketUpdates();
  }

  private listenSocketUpdates() {
    this.socket.onRoomsList((rooms) => this.rooms.set(rooms));
    this.socket.onRoomJoined((room) => {
      this.currentRoom.set(room);
      this.api.setCurrentRoom(room); // persistencia local
    });
  }

  init() {
    // 1️⃣ Cargar desde API
    this.api.getRoomList();
    this.rooms.set(this.api.roomList());

    // 2️⃣ Pedir lista actualizada por WS
    this.socket.requestRoomsList();
  }

  createRoom(player: Player) {
    this.socket.createRoom(player);
  }

  joinRoom(roomId: string, player: Player) {
    this.socket.joinRoom(roomId, player);
  }
}

// src/app/core/services/room-store.service.ts
import { Injectable, effect, inject, signal } from '@angular/core';
import { Room, RoomConfig, createDefaultRoomConfig } from '../models/room.model';
import { Player } from '../models/player.model';
import { ApiRoomService } from './api/api.room.service';
import { SocketRoomService } from './socket/socket.room.service';
import { Router } from '@angular/router';
import { ApiPlayerService } from './api/api.player.service';

@Injectable({ providedIn: 'root' })
export class RoomStoreService {
  private api = inject(ApiRoomService);
  private socket = inject(SocketRoomService);
  private router = inject(Router);
  private apiPlayer = inject(ApiPlayerService);

  rooms = signal<Room[]>([]);
  currentRoom = signal<Room | null>(null);
  roomTimerSeconds = signal<number | null>(null);

  constructor() {
    this.listenSocketUpdates();

    effect(() => {
      const room = this.currentRoom();
      if (!room) return;

      const currentUrl = this.router.url;
      const targetUrl = `/room/${room.id}`;

      if (currentUrl.startsWith(`/game/${room.id}`)) return;
      if (currentUrl.startsWith(targetUrl)) return;

      this.router.navigate(['/room', room.id]);
    });
  }

  private listenSocketUpdates() {
    this.socket.onRoomsList((rooms) =>
      this.rooms.set(rooms.map((room) => this.ensureRoomHasConfig(room)))
    );
    this.socket.onRoomJoined((room) => {
      const playerId = this.apiPlayer.player()?.id;
      if (!playerId) return;

      const isMember = room.players.some((pl) => pl.id === playerId);

      if (isMember) {
        const normalized = this.api.setCurrentRoom(room); // persistencia local
        this.currentRoom.set(this.ensureRoomHasConfig(normalized));
      } else if (this.currentRoom()?.id === room.id) {
        this.currentRoom.set(null);
        this.api.clearCurrentRoom();
        this.router.navigate(['/room-list']);
      }
    });
    this.socket.onRoomClosed(() => {
      this.currentRoom.set(null);
      this.roomTimerSeconds.set(null);
      this.api.clearCurrentRoom();
      this.router.navigate(['/room-list']);
    });
    this.socket.onRoomTimer(({ remainingSeconds }) => {
      this.roomTimerSeconds.set(remainingSeconds);
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
    const player = this.apiPlayer.player();
    this.api.getRoomById(id).subscribe((room) => {
      this.currentRoom.set(room);

      if (player && !room.players.some((pl) => pl.id === player.id)) {
        this.joinRoom(room.id, player);
      }
    });
  }

  createRoom(player: Player, visibility: Room['visibility'] = 'public') {
    this.socket.createRoom(player, visibility);
  }

  joinRoom(roomKey: string, player: Player) {
    const normalized = this.normalizeRoomKey(roomKey);
    if (!normalized) return;
    this.socket.joinRoom(normalized, player);
  }

  leaveRoom(roomId: string, player: Player) {
    this.socket.leaveRoom(roomId, player);
    this.currentRoom.set(null);
    this.roomTimerSeconds.set(null);
    this.api.clearCurrentRoom();
  }

  updateRoomConfig(roomId: string, config: Partial<RoomConfig>) {
    this.socket.updateRoomConfig(roomId, config);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  private normalizeRoomKey(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const urlMatch = trimmed.match(/room\/([A-Za-z0-9-]+)/i);
    const candidate = urlMatch ? urlMatch[1] : trimmed;
    const cleaned = candidate.replace(/\s+/g, '');

    return cleaned.toLowerCase();
  }

  private ensureRoomHasConfig(room: Room): Room {
    return {
      ...room,
      config: room.config ?? createDefaultRoomConfig(),
    };
  }
}

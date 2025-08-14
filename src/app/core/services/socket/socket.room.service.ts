import { Injectable, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { Room } from '../../models/room.model';
import { SocketService } from './socket.service';
import { ROOM_CONSTANTS } from '../../constants/room.constants';

@Injectable({ providedIn: 'root' })
export class SocketRoomService {
  roomList = signal<Room[]>([]);
  currentRoom = signal<Room | null>(null);

  constructor(private socketService: SocketService) {
    this.registerListeners();
    this.loadRooms();
  }

  private registerListeners() {
    this.socketService.on(ROOM_CONSTANTS.ROOMS_LIST, (rooms: Room[]) => {
      this.roomList.set(rooms);
    });

    this.socketService.on(ROOM_CONSTANTS.ROOM_CREATED, (room: Room) => {
      // this.currentRoom.set(room);

      this.currentRoom.set(room);
      this.roomList.update((r) => [...r, room]);
    });

    this.socketService.on(ROOM_CONSTANTS.ROOM_JOINED, (room: Room) => {
      // this.currentRoom.set(room);

      this.roomList.update((r) =>
        r.map((existingRoom) =>
          existingRoom.id === room.id ? room : existingRoom
        )
      );
      this.currentRoom.set(room);
    });
  }

  createRoom(player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_NEW, { player });
  }

  joinRoom(roomId: string, player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_JOIN, { roomId, player });
  }

  loadRooms() {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_GET_ALL);
  }
}

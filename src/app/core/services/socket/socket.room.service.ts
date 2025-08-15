import { inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { Room } from '../../models/room.model';
import { SocketService } from './socket.service';
import { ROOM_CONSTANTS } from '../../constants/room.constants';

@Injectable({ providedIn: 'root' })
export class SocketRoomService {
  private socketService = inject(SocketService);

  onRoomsList(callback: (rooms: Room[]) => void) {
    this.socketService.on(ROOM_CONSTANTS.ROOMS_LIST, callback);
  }

  onRoomJoined(callback: (room: Room) => void) {
    this.socketService.on(ROOM_CONSTANTS.ROOM_JOINED, callback);
  }

  createRoom(player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_NEW, { player });
  }

  joinRoom(roomId: string, player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_JOIN, { roomId, player });
  }

  requestRoomsList() {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_GET_ALL);
  }
}

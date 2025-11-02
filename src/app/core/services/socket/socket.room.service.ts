import { inject, Injectable } from '@angular/core';
import { Room } from '../../models/room.model';
import { SocketService } from './socket.service';
import { ROOM_CONSTANTS } from '../../constants/room.constants';
import { Player } from '../../models/player.model';

@Injectable({ providedIn: 'root' })
export class SocketRoomService {
  private socketService = inject(SocketService);

  onRoomsList(callback: (rooms: Room[]) => void) {
    this.socketService.on(ROOM_CONSTANTS.ROOMS_LIST, callback);
  }

  onRoomJoined(callback: (room: Room) => void) {
    this.socketService.on(ROOM_CONSTANTS.ROOM_JOINED, callback);
  }

  createRoom(player: Player, visibility: Room['visibility']) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_NEW, { player, visibility });
  }

  joinRoom(roomId: string, player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_JOIN, { roomId, player });
  }

  leaveRoom(roomId: string, player: Player) {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_LEAVE, {
      roomId,
      playerId: player.id,
    });
  }

  requestRoomsList() {
    this.socketService.emit(ROOM_CONSTANTS.ROOM_GET_ALL);
  }
}

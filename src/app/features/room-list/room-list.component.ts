import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { RoomStoreService } from '../../core/services/room-store.service';
import { MAX_ROOM_PLAYERS } from '../../core/constants/room.constants';

@Component({
  selector: 'app-room-list',
  standalone: true,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent implements OnInit {
  private apiPlayerService = inject(ApiPlayerService);
  private store = inject(RoomStoreService);
  private router = inject(Router);

  roomList = this.store.rooms;
  player = this.apiPlayerService.player;
  readonly MAX_PLAYERS = MAX_ROOM_PLAYERS;

  ngOnInit() {
    if (!this.player()) {
      this.router.navigate(['/home']);
      return;
    }
    this.store.getRooms();
  }

  createRoom(visibility: Room['visibility']) {
    this.store.createRoom(this.player()!, visibility);
  }

  joinRoom(roomId: string) {
    const room = this.roomList().find((r) => r.id === roomId);
    if (!room || this.isRoomFull(room) || room.inProgress) return;
    this.store.joinRoom(roomId, this.player()!);
  }

  joinRoomByCode(input: HTMLInputElement) {
    const roomId = input.value.trim();
    if (!roomId) return;
    this.store.joinRoom(roomId, this.player()!);
    input.value = '';
  }

  isRoomFull(room: Room): boolean {
    return room.players.length >= this.MAX_PLAYERS;
  }
}

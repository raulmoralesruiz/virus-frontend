import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { Player } from '../../core/models/player.model';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { ApiRoomService } from '../../core/services/api/api.room.service';
import { RoomStoreService } from '../../core/services/room-store.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent implements OnInit {
  private apiPlayerService = inject(ApiPlayerService);
  private store = inject(RoomStoreService);

  roomList = this.store.rooms;
  player = this.apiPlayerService.player;

  ngOnInit() {
    this.store.getRooms();
  }

  createRoom() {
    this.store.createRoom(this.player()!);
  }

  joinRoom(roomId: string) {
    const room = this.roomList().find((r) => r.id === roomId);
    if (room?.inProgress) return;
    this.store.joinRoom(roomId, this.player()!);
  }
}

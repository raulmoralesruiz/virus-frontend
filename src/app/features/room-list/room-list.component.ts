import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
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
  private router = inject(Router);

  roomList = this.store.rooms;
  player = this.apiPlayerService.player;

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
    if (room?.inProgress) return;
    this.store.joinRoom(roomId, this.player()!);
  }

  joinRoomByCode(input: HTMLInputElement) {
    const roomId = input.value.trim();
    if (!roomId) return;
    this.store.joinRoom(roomId, this.player()!);
    input.value = '';
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { RoomStoreService } from '../../core/services/room-store.service';
import { RoomCreationComponent } from './components/room-creation/room-creation.component';
import { RoomJoinComponent } from './components/room-join/room-join.component';
import { RoomItemComponent } from './components/room-item/room-item.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [RoomCreationComponent, RoomJoinComponent, RoomItemComponent],
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

  handleCreateRoom(visibility: Room['visibility']) {
    this.store.createRoom(this.player()!, visibility);
  }

  handleJoinRoom(roomId: string) {
    this.store.joinRoom(roomId, this.player()!);
  }
}

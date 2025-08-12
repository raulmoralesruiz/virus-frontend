import { Component, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { PlayerService } from '../../core/services/player.service';
import { Room } from '../../core/models/room.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent {
  rooms!: Signal<Room[]>;

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService,
    private router: Router
  ) {
    this.rooms = this.roomService.rooms;
  }

  createRoom(name: string) {
    const player = this.playerService.player();
    if (!player || !name.trim()) return;
    this.roomService.createRoom(name, player);
    this.router.navigate(['/room']);
  }

  joinRoom(roomId: string) {
    const player = this.playerService.player();
    if (!player) return;
    this.roomService.joinRoom(roomId, player);
    this.router.navigate(['/room']);
  }
}

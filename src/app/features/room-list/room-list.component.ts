import { Component, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { PlayerService } from '../../core/services/player.service';
import { Room } from '../../core/models/room.model';
import { SocketService } from '../../core/services/socket.service';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-room-list',
  standalone: true,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent {
  rooms!: Signal<Room[]>;
  player: Signal<Player | null>;

  constructor(
    private roomService: RoomService,
    private playerService: PlayerService,
    private router: Router,
    private socketService: SocketService
  ) {
    if (!this.socketService.connected()) {
      console.warn('⚠️ No conectado, redirigiendo al Home');
      this.router.navigate(['/']);
    }

    this.rooms = this.roomService.roomList;
    this.player = this.playerService.player;
  }

  createRoom() {
    if (!this.player()) return;
    this.roomService.createRoom(this.player()!);
    this.router.navigate(['/room']);
  }

  joinRoom(roomId: string) {
    if (!this.player()) return;
    this.roomService.joinRoom(roomId, this.player()!);
    this.router.navigate(['/room']);
  }

  // createRoom() {
  //   if (!this.player()) return;
  //   this.roomService.createRoom();
  // }

  // joinRoom(roomId: string) {
  //   if (!this.player()) return;
  //   this.roomService.joinRoom(roomId, this.player()!);
  //   this.router.navigate(['/room']);
  // }
}

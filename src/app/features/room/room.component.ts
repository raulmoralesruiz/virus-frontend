import { Component, Signal } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { Room } from '../../core/models/room.model';
import { SocketService } from '../../core/services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  room!: Signal<Room | null>;

  constructor(
    private roomService: RoomService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.room = this.roomService.currentRoom;

    if (!this.socketService.connected()) {
      console.warn('⚠️ No conectado, redirigiendo al Home');
      this.router.navigate(['/']);
    }
  }
}

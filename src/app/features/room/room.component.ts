import { Component, Signal } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { Room } from '../../core/models/room.model';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  room!: Signal<Room | null>;

  constructor(private roomService: RoomService) {
    this.room = this.roomService.currentRoom;
  }
}

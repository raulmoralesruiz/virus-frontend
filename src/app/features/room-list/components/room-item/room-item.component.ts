import { Component, input, output } from '@angular/core';
import { Room } from '@core/models/room.model';
import { MAX_ROOM_PLAYERS } from '@core/constants/room.constants';

@Component({
  selector: 'app-room-item',
  standalone: true,
  imports: [],
  templateUrl: './room-item.component.html',
  styleUrl: './room-item.component.css'
})
export class RoomItemComponent {
  room = input.required<Room>();
  join = output<string>();

  get isRoomFull(): boolean {
    return this.room().players.length >= MAX_ROOM_PLAYERS;
  }

  onJoin() {
    if (this.room().inProgress || this.isRoomFull) return;
    this.join.emit(this.room().id);
  }
}

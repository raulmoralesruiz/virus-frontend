import { Component, output } from '@angular/core';
import { Room } from '@core/models/room.model';

@Component({
  selector: 'app-room-creation',
  standalone: true,
  imports: [],
  templateUrl: './room-creation.component.html',
  styleUrl: './room-creation.component.css'
})
export class RoomCreationComponent {
  create = output<Room['visibility']>();

  onCreate(visibility: Room['visibility']) {
    this.create.emit(visibility);
  }
}

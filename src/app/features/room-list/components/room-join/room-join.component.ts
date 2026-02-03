import { Component, output } from '@angular/core';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [],
  templateUrl: './room-join.component.html',
  styleUrl: './room-join.component.css'
})
export class RoomJoinComponent {
  join = output<string>();

  onJoin(input: HTMLInputElement) {
    const roomId = input.value.trim();
    if (!roomId) return;
    this.join.emit(roomId);
    input.value = '';
  }
}

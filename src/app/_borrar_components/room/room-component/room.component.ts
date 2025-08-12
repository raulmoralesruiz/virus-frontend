import { Component, signal } from '@angular/core';
import { RoomService } from '../room.service';

@Component({
  selector: 'room-component',
  imports: [],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  playerName = signal('');
  roomId = signal('');
  constructor(public roomService: RoomService) {}

  create() {
    console.log('Creating room with player name:', this.playerName());
    if (this.playerName()) {
      this.roomService.createRoom(this.playerName());
    }
  }

  join() {
    console.log(
      'Joining room with ID:',
      this.roomId(),
      'and player name:',
      this.playerName()
    );
    if (this.roomId() && this.playerName()) {
      this.roomService.joinRoom(this.roomId(), this.playerName());
    }
  }

  updatePlayerName(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.playerName.set(input.value);
    }
  }

  updateRoomId(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.roomId.set(input.value);
    }
  }

  // isConnected(): boolean {
  //   return this.roomService.socket && this.roomService.socket.connected;
  // }

  // disconnect() {
  //   this.roomService.socket.disconnect();
  // }

  // connect() {
  //   this.roomService.socket.connect();
  // }
}

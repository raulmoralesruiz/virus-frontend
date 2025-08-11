import { Component, signal } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'socket-ping',
  standalone: true,
  templateUrl: './socket-ping.component.html',
  styleUrl: './socket-ping.component.css',
})
export class SocketPing {
  newMessage = signal('');

  constructor(public socketService: SocketService) {}

  send() {
    if (this.newMessage().trim()) {
      this.socketService.sendMessage(this.newMessage());
      this.newMessage.set('');
    }
  }

  updateNewMessage(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.newMessage.set(input.value);
    }
  }

  disconnect() {
    this.socketService.disconnect();
  }

  connect() {
    this.socketService.connect();
  }

  isConnected(): boolean {
    return this.socketService.isConnected();
  }
}

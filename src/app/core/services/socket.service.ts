import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  connected = signal(false);

  connect() {
    if (!this.socket) {
      this.socket = io(environment.socketUrl);
      this.socket.on('connect', () => this.connected.set(true));
      this.socket.on('disconnect', () => this.connected.set(false));
    }
  }

  emit = (event: string, data?: any) => {
    this.socket.emit(event, data);
  };

  on = (event: string, callback: (data: any) => void) => {
    this.socket.on(event, callback);
  };
}

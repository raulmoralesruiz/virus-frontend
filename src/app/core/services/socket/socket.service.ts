import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  connected = signal(false);

  connect() {
    console.log('Connecting to socket server...');

    if (!this.socket || !this.socket.connected) {
      this.socket = io(environment.socketUrl, { transports: ['websocket'] });

      this.socket.on('connect', () => {
        this.connected.set(true);
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        this.connected.set(false);
        console.log('Disconnected from socket server');
      });
    }
  }

  emit = (event: string, data?: any) => {
    this.socket.emit(event, data);
  };

  on = (event: string, callback: (data: any) => void) => {
    this.socket.on(event, callback);
  };

  disconnect() {
    this.socket.disconnect();
  }
}

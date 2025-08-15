import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  connected = signal(false);

  constructor() {
    this.connect();
  }

  connect() {
    if (this.socket?.connected) return;

    console.log('Connecting to socket server...');
    this.socket = io(environment.socketUrl, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      this.connected.set(true);
      console.log('✅ Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
      console.log('❌ Disconnected from socket server');
    });
  }

  emit(event: string, data?: any) {
    if (!this.socket) {
      console.warn(`Socket not connected. Event "${event}" not sent.`);
      return;
    }
    console.log(`Emitting event "${event}" with data:`, data);
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn(`Socket not connected. Cannot listen to "${event}".`);
      return;
    }
    console.log(`Listening for event ${event}`);
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    console.log(`Removing listener for event ${event}`);
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

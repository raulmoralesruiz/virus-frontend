// frontend/src/app/socket.service.ts
import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  messages = signal<string[]>([]);

  constructor() {
    // Cambia URL si no estás en localhost o puerto distinto
    this.socket = io(environment.socketUrl, {
      autoConnect: true,
      transports: ['websocket'], // Fuerza WebSocket para menor latencia
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor Socket.IO');
    });

    this.socket.on('message', (msg: string) => {
      this.messages.update((current) => [...current, msg]);
    });
  }

  sendMessage(msg: string) {
    console.log(`Enviando mensaje: ${msg}`);
    this.socket.emit('message', msg);
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Desconectado del servidor Socket.IO');
    }
  }

  connect() {
    if (!this.isConnected()) {
      this.socket.connect();
      console.log('Conectando al servidor Socket.IO...');
    }
  }
}

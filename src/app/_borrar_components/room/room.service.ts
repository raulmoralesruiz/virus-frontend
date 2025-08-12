import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { RoomOld } from '../../_borrar_interfaces/Room.interface';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private socket: Socket;
  roomData = signal<RoomOld>({
    id: '',
    players: [],
  });

  constructor() {
    // Cambia URL si no estás en localhost o puerto distinto
    this.socket = io(environment.socketUrl, {
      autoConnect: true,
      transports: ['websocket'], // Fuerza WebSocket para menor latencia
    });

    this.socket.on('roomData', (data) => this.roomData.set(data));
  }

  createRoom(playerName: string) {
    this.socket.emit('createRoom', playerName, (roomId: string) => {
      console.log('Sala creada con ID:', roomId);
    });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('joinRoom', roomId, playerName, (success: boolean) => {
      if (!success) console.error('Sala no encontrada');
      else console.log('Unido a la sala:', roomId);
    });
  }
}

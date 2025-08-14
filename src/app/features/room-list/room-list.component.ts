import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from '../../core/models/room.model';
import { Player } from '../../core/models/player.model';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { ApiRoomService } from '../../core/services/api/api.room.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent implements OnInit {
  private apiRoomService = inject(ApiRoomService);
  private apiPlayerService = inject(ApiPlayerService);
  private router = inject(Router);

  roomList = this.apiRoomService.roomList;
  player = this.apiPlayerService.player;

  ngOnInit() {
    this.getRoomList();

    const currentRoom = this.apiRoomService.currentRoom();
    if (currentRoom) {
      console.log(`sala actual:`, currentRoom);
      this.router.navigate(['/room', currentRoom.id]);
    }
  }

  getRoomList() {
    this.apiRoomService.getRoomList().subscribe({
      error: (err) => console.error('Error al obtener salas', err),
    });
  }

  createRoom() {
    const p = this.player();
    if (!p) return;

    this.apiRoomService.createRoom(p.id).subscribe({
      next: (room) => {
        this.apiRoomService.setCurrentRoom(room);
        this.router.navigate(['/room', room.id]);
      },
      error: (err) => console.error('Error al crear sala', err),
    });
  }

  joinRoom(roomId: string) {
    this.apiRoomService.joinRoom(roomId).subscribe({
      next: (room) => {
        this.apiRoomService.setCurrentRoom(room);
        this.router.navigate(['/room', room.id]);
      },
      error: (err) => console.error('Error al unirse a la sala', err),
    });
  }
}

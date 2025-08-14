import { Component, inject, OnInit, Signal } from '@angular/core';
import { Room } from '../../core/models/room.model';
import { ActivatedRoute } from '@angular/router';
import { ApiRoomService } from '../../core/services/api/api.room.service';
import { SocketRoomService } from '../../core/services/socket/socket.room.service';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  private apiRoomService = inject(ApiRoomService);
  // private socketRoomService = inject(SocketRoomService);
  private route = inject(ActivatedRoute);

  room: Room | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Primero desde localStorage (vía ApiRoomService)
    this.room = this.apiRoomService.currentRoom();

    // Si no hay sala o no coincide el ID, cargar desde backend
    if (!this.room || this.room.id !== id) {
      this.apiRoomService.getRoomById(id).subscribe((room) => {
        this.room = room;
      });
    }
  }
}

import { Component, inject, OnInit, Signal } from '@angular/core';
import { Room } from '../../core/models/room.model';
import { ActivatedRoute } from '@angular/router';
import { ApiRoomService } from '../../core/services/api/api.room.service';
import { RoomStoreService } from '../../core/services/room-store.service';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  private store = inject(RoomStoreService);
  private route = inject(ActivatedRoute);

  room = this.store.currentRoom;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Si no hay sala cargada o no coincide, pedirla al backend vía store
    if (!this.room() || this.room()!.id !== id) {
      this.store.loadRoomById(id);
    }
  }
}

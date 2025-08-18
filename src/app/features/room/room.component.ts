import { Component, inject, OnInit, Signal } from '@angular/core';
import { Room } from '../../core/models/room.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRoomService } from '../../core/services/api/api.room.service';
import { RoomStoreService } from '../../core/services/room-store.service';
import { GameStoreService } from '../../core/services/game-store.service';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  private route = inject(ActivatedRoute);
  // private router = inject(Router);
  private roomStore = inject(RoomStoreService);
  private gameStore = inject(GameStoreService);

  roomId!: string;
  room = this.roomStore.currentRoom;

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    if (!this.room()) {
      this.roomStore.loadRoomById(this.roomId);
    }
  }

  startGame() {
    this.gameStore.startGame(this.roomId);
    // this.router.navigate(['/game', this.roomId]);
  }

  // ngOnInit() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (!id) return;

  //   // Si no hay sala cargada o no coincide, pedirla al backend vía store
  //   if (!this.room() || this.room()!.id !== id) {
  //     this.roomStore.loadRoomById(id);
  //   }

  //   // Volver a home si no existe la sala indicada por id
  //   if (id && !this.room()) {
  //     this.router.navigate(['/home']);
  //   }
  // }
}

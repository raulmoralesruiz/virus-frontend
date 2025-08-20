import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomStoreService } from '../../core/services/room-store.service';
import { GameStoreService } from '../../core/services/game-store.service';
import { ApiPlayerService } from '../../core/services/api/api.player.service';

@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomStore = inject(RoomStoreService);
  private gameStore = inject(GameStoreService);
  private apiPlayer = inject(ApiPlayerService);

  roomId!: string;
  room = this.roomStore.currentRoom;
  player = this.apiPlayer.player;

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    if (!this.room()) {
      this.roomStore.loadRoomById(this.roomId);
    }
  }

  startGame() {
    this.gameStore.startGame(this.roomId);
  }

  isHost(): boolean {
    const r = this.room();
    const p = this.player();
    return !!r && !!p && r.hostId === p.id;
  }
}

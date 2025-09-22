import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);

  roomId!: string;
  room = this.roomStore.currentRoom;
  player = this.apiPlayer.player;
  confirmingLeave = false;

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

  isIncorrectNumberPlayers(): boolean {
    const minPlayers = 2;
    const maxPlayers = 6;
    const numPlayers = this.room()!.players.length;
    return numPlayers < minPlayers || numPlayers > maxPlayers;
  }

  goHome() {
    this.roomStore.goHome();
  }

  leaveRoom() {
    this.confirmingLeave = true;
  }

  confirmLeave() {
    if (this.roomId) {
      const player = this.player();
      if (player) {
        this.roomStore.leaveRoom(this.roomId, player);
      }
    }

    this.confirmingLeave = false;
    this.router.navigate(['/room-list']);
  }

  cancelLeave() {
    this.confirmingLeave = false;
  }
}

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class RoomComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private roomStore = inject(RoomStoreService);
  private gameStore = inject(GameStoreService);
  private apiPlayer = inject(ApiPlayerService);
  private router = inject(Router);
  private shareMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  roomId!: string;
  room = this.roomStore.currentRoom;
  player = this.apiPlayer.player;
  confirmingLeave = false;
  shareMessage: string | null = null;

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    if (!this.room()) {
      this.roomStore.loadRoomById(this.roomId);
    }
  }

  ngOnDestroy(): void {
    if (this.shareMessageTimeout) {
      clearTimeout(this.shareMessageTimeout);
      this.shareMessageTimeout = null;
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

  copyRoomCode() {
    const currentRoom = this.room();
    const code = currentRoom?.name ?? currentRoom?.id?.slice(0, 6) ?? '';
    if (!code) return;
    this.copyToClipboard(code, 'ID de sala copiado');
  }

  copyRoomLink() {
    const currentRoom = this.room();
    if (!currentRoom) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin) return;
    const link = `${origin}/room/${currentRoom.id}`;
    this.copyToClipboard(link, 'Enlace copiado');
  }

  private copyToClipboard(value: string, message: string) {
    if (!value) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() => this.setShareMessage(message))
        .catch(() => this.fallbackCopy(value, message));
    } else {
      this.fallbackCopy(value, message);
    }
  }

  private fallbackCopy(value: string, message: string) {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      this.setShareMessage(message);
    } catch (error) {
      console.warn('No se pudo copiar al portapapeles', error);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private setShareMessage(message: string) {
    this.shareMessage = message;
    if (this.shareMessageTimeout) {
      clearTimeout(this.shareMessageTimeout);
    }
    this.shareMessageTimeout = setTimeout(() => {
      this.shareMessage = null;
      this.shareMessageTimeout = null;
    }, 2500);
  }
}

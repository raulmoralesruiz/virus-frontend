import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomStoreService } from '../../core/services/room-store.service';
import { GameStoreService } from '../../core/services/game-store.service';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import {
  RoomConfig,
  RoomGameMode,
  RoomTimerSeconds,
  createDefaultRoomConfig,
} from '../../core/models/room.model';
import { Subscription } from 'rxjs';

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
  isCreatingPlayer = false;
  creationError: string | null = null;
  private createPlayerSub: Subscription | null = null;
  readonly gameModeOptions: { value: RoomGameMode; label: string }[] = [
    { value: 'base', label: 'Juego base' },
    { value: 'halloween', label: 'Base + Halloween' },
  ];
  readonly timerOptions: RoomTimerSeconds[] = [30, 60, 90, 120];
  private readonly defaultConfig = createDefaultRoomConfig();

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
    if (this.createPlayerSub) {
      this.createPlayerSub.unsubscribe();
      this.createPlayerSub = null;
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

  canEditConfig(): boolean {
    const room = this.room();
    return !!room && !room.inProgress && this.isHost();
  }

  getRoomConfig(): RoomConfig {
    return this.room()?.config ?? this.defaultConfig;
  }

  onGameModeSelect(value: string) {
    const mode = value as RoomGameMode;
    if (!this.isValidMode(mode)) return;
    const room = this.room();
    if (!room || !this.canEditConfig()) return;
    if (room.config?.mode === mode) return;
    this.roomStore.updateRoomConfig(room.id, { mode });
  }

  onTimerSelect(value: string) {
    const numeric = Number(value);
    const seconds = numeric as RoomTimerSeconds;
    if (!this.isValidTimer(seconds)) return;
    const room = this.room();
    if (!room || !this.canEditConfig()) return;
    if (room.config?.timerSeconds === seconds) return;
    this.roomStore.updateRoomConfig(room.id, { timerSeconds: seconds });
  }

  private isValidMode(mode: string): mode is RoomGameMode {
    return this.gameModeOptions.some((option) => option.value === mode);
  }

  private isValidTimer(seconds: number): seconds is RoomTimerSeconds {
    return this.timerOptions.includes(seconds as RoomTimerSeconds);
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

  createPlayerAndJoin(input: HTMLInputElement) {
    if (this.player() || this.isCreatingPlayer) return;

    const name = input.value.trim();
    if (!name) {
      this.creationError = 'Introduce tu nombre para continuar.';
      return;
    }

    this.creationError = null;
    this.isCreatingPlayer = true;
    if (this.createPlayerSub) {
      this.createPlayerSub.unsubscribe();
    }

    this.createPlayerSub = this.apiPlayer.createPlayer(name).subscribe({
      next: (player) => {
        this.isCreatingPlayer = false;
        this.roomStore.joinRoom(this.roomId, player);
      },
      error: () => {
        this.isCreatingPlayer = false;
        this.creationError =
          'No pudimos crear tu jugador. Inténtalo de nuevo en unos segundos.';
      },
    });
  }
}

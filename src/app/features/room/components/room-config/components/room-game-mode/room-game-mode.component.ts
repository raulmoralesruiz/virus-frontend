import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Room, RoomGameMode } from '@core/models/room.model';
import { RoomStoreService } from '@core/services/room-store.service';

@Component({
  selector: 'app-room-game-mode',
  standalone: true,
  imports: [],
  templateUrl: './room-game-mode.component.html',
  styleUrl: './room-game-mode.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomGameModeComponent {
  private roomStore = inject(RoomStoreService);

  room = input.required<Signal<Room | null>>();
  canEditConfig = input.required<boolean>();

  readonly gameModeOptions: { value: RoomGameMode; label: string }[] = [
    { value: 'base', label: 'Virus!' },
    { value: 'halloween', label: 'Halloween' },
  ];

  getRoomConfig() {
    return this.room()()?.config;
  }

  onGameModeSelect(value: string) {
    const mode = value as RoomGameMode;
    if (!this.isValidMode(mode)) return;
    const room = this.room()();
    if (!room || !this.canEditConfig()) return;
    if (room.config?.mode === mode) return;
    this.roomStore.updateRoomConfig(room.id, { mode });
  }

  private isValidMode(mode: string): mode is RoomGameMode {
    return this.gameModeOptions.some((option) => option.value === mode);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EffectRef,
  effect,
  inject,
  input,
  OnDestroy,
  Signal,
} from '@angular/core';
import {
  createDefaultRoomConfig,
  Room,
  RoomConfig,
  RoomGameMode,
  RoomTimerSeconds,
} from '../../../../core/models/room.model';
import { RoomStoreService } from '../../../../core/services/room-store.service';

@Component({
  selector: 'app-room-config',
  standalone: true,
  imports: [],
  templateUrl: './room-config.component.html',
  styleUrl: './room-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomConfigComponent implements OnDestroy {
  private roomStore = inject(RoomStoreService);

  room = input.required<Signal<Room | null>>();
  canEditConfig = input.required<boolean>();

  readonly gameModeOptions: { value: RoomGameMode; label: string }[] = [
    { value: 'base', label: 'Virus!' },
    { value: 'halloween', label: 'Halloween' },
  ];
  readonly timerOptions: RoomTimerSeconds[] = [30, 60, 90, 120];
  private readonly timerIndexMax = this.timerOptions.length - 1;
  private readonly defaultConfig = createDefaultRoomConfig();

  private sliderSelectionIndex: number | null = null;
  private readonly sliderSelectionEffect: EffectRef;

  constructor() {
    this.sliderSelectionEffect = effect(() => {
      const currentSeconds = this.getRoomConfig().timerSeconds;
      if (this.sliderSelectionIndex !== null) {
        const selectedSeconds = this.timerOptions[this.sliderSelectionIndex];
        if (selectedSeconds === currentSeconds) {
          this.sliderSelectionIndex = null;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sliderSelectionEffect.destroy();
  }

  getRoomConfig(): RoomConfig {
    return this.room()()?.config ?? this.defaultConfig;
  }

  onGameModeSelect(value: string) {
    const mode = value as RoomGameMode;
    if (!this.isValidMode(mode)) return;
    const room = this.room()();
    if (!room || !this.canEditConfig()) return;
    if (room.config?.mode === mode) return;
    this.roomStore.updateRoomConfig(room.id, { mode });
  }

  onTimerSelect(value: string) {
    const index = Number(value);
    if (!Number.isInteger(index) || index < 0 || index > this.timerIndexMax) {
      return;
    }
    const seconds = this.timerOptions[index];
    if (!this.isValidTimer(seconds)) return;
    this.sliderSelectionIndex = index;
    const room = this.room()();
    if (!room || !this.canEditConfig()) return;
    if (room.config?.timerSeconds === seconds) return;
    this.roomStore.updateRoomConfig(room.id, { timerSeconds: seconds });
  }

  getTimerIndex(): number {
    const seconds = this.getRoomConfig().timerSeconds;
    const index = this.timerOptions.indexOf(seconds);
    return index >= 0 ? index : 0;
  }

  getSliderIndex(): number {
    if (this.sliderSelectionIndex !== null) {
      return this.sliderSelectionIndex;
    }
    return this.getTimerIndex();
  }

  getSliderProgress(): number {
    if (this.timerIndexMax <= 0) {
      return 0;
    }
    return this.getSliderIndex() / this.timerIndexMax;
  }

  getTickPosition(index: number): number {
    if (index <= 0 || this.timerIndexMax <= 0) {
      return 0;
    }
    if (index >= this.timerIndexMax) {
      return 100;
    }
    return (index / this.timerIndexMax) * 100;
  }

  private isValidMode(mode: string): mode is RoomGameMode {
    return this.gameModeOptions.some((option) => option.value === mode);
  }

  private isValidTimer(seconds: number): seconds is RoomTimerSeconds {
    return this.timerOptions.includes(seconds as RoomTimerSeconds);
  }
}
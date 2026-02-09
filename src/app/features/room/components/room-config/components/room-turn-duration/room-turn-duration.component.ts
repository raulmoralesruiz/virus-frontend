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
  RoomTimerSeconds,
} from '@core/models/room.model';
import { RoomStoreService } from '@core/services/room-store.service';

@Component({
  selector: 'app-room-turn-duration',
  standalone: true,
  imports: [],
  templateUrl: './room-turn-duration.component.html',
  styleUrl: './room-turn-duration.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTurnDurationComponent implements OnDestroy {
  private roomStore = inject(RoomStoreService);

  room = input.required<Signal<Room | null>>();
  canEditConfig = input.required<boolean>();

  readonly timerOptions: RoomTimerSeconds[] = [30, 60, 90, 120];
  private readonly timerIndexMax = this.timerOptions.length - 1;
  private readonly defaultConfig = createDefaultRoomConfig();

  private sliderSelectionIndex: number | null = null;
  private readonly sliderSelectionEffect: EffectRef;

  constructor() {
    this.sliderSelectionEffect = effect(() => {
      const currentSeconds = this.getRoomConfig()?.timerSeconds;
      if (this.sliderSelectionIndex !== null && currentSeconds !== undefined) {
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

  getRoomConfig() {
    return this.room()()?.config ?? this.defaultConfig;
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

  private isValidTimer(seconds: number): seconds is RoomTimerSeconds {
    return this.timerOptions.includes(seconds as RoomTimerSeconds);
  }
}

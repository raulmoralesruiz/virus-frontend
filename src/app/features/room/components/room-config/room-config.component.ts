import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  RoomConfig,
  RoomGameMode,
  RoomTimerSeconds,
} from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-config',
  standalone: true,
  imports: [],
  templateUrl: './room-config.component.html',
  styleUrl: './room-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomConfigComponent {
  canEditConfig = input.required<boolean>();
  roomConfig = input.required<RoomConfig>();
  gameModeOptions = input.required<{
    value: RoomGameMode;
    label: string;
  }[]>();
  timerOptions = input.required<RoomTimerSeconds[]>();
  sliderIndex = input.required<number>();
  sliderProgress = input.required<number>();
  gameModeSelect = output<string>();
  timerSelect = output<string>();

  getTickPosition(index: number): number {
    const timerIndexMax = this.timerOptions().length - 1;
    if (index <= 0 || timerIndexMax <= 0) {
      return 0;
    }
    if (index >= timerIndexMax) {
      return 100;
    }
    return (index / timerIndexMax) * 100;
  }
}
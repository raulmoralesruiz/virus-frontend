import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
  @Input({ required: true }) canEditConfig!: boolean;
  @Input({ required: true }) roomConfig!: RoomConfig;
  @Input({ required: true }) gameModeOptions!: {
    value: RoomGameMode;
    label: string;
  }[];
  @Input({ required: true }) timerOptions!: RoomTimerSeconds[];
  @Input({ required: true }) sliderIndex!: number;
  @Input({ required: true }) sliderProgress!: number;
  @Output() gameModeSelect = new EventEmitter<string>();
  @Output() timerSelect = new EventEmitter<string>();

  getTickPosition(index: number): number {
    const timerIndexMax = this.timerOptions.length - 1;
    if (index <= 0 || timerIndexMax <= 0) {
      return 0;
    }
    if (index >= timerIndexMax) {
      return 100;
    }
    return (index / timerIndexMax) * 100;
  }
}
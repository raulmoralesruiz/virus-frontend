import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { Room } from '@core/models/room.model';
import { RoomGameModeComponent } from './components/room-game-mode/room-game-mode.component';
import { RoomTurnDurationComponent } from './components/room-turn-duration/room-turn-duration.component';

@Component({
  selector: 'app-room-config',
  standalone: true,
  imports: [RoomGameModeComponent, RoomTurnDurationComponent],
  templateUrl: './room-config.component.html',
  styleUrl: './room-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomConfigComponent {
  room = input.required<Signal<Room | null>>();
  canEditConfig = input.required<boolean>();
}

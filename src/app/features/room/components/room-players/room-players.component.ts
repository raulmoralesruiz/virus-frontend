import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { Room } from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-players',
  standalone: true,
  imports: [],
  templateUrl: './room-players.component.html',
  styleUrl: './room-players.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPlayersComponent {
  room = input.required<Signal<Room | null>>();
}
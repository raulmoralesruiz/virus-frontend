import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';
import { Room } from '@core/models/room.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-room-players',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './room-players.component.html',
  styleUrl: './room-players.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPlayersComponent {
  room = input.required<Signal<Room | null>>();
}
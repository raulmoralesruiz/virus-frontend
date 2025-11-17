import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Signal,
} from '@angular/core';
import { Room } from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-top',
  standalone: true,
  imports: [],
  templateUrl: './room-top.component.html',
  styleUrl: './room-top.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTopComponent {
  room = input.required<Signal<Room | null>>();
  shareMessage = input<string | null>(null);
  copyRoomCode = output<void>();
  copyRoomLink = output<void>();
  leaveRoom = output<void>();
}
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
  @Input({ required: true }) room!: Signal<Room | null>;
  @Input() shareMessage: string | null = null;
  @Output() copyRoomCode = new EventEmitter<void>();
  @Output() copyRoomLink = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
}
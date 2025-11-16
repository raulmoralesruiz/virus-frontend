import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-room-exit',
  standalone: true,
  imports: [],
  templateUrl: './room-exit.component.html',
  styleUrl: './room-exit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomExitComponent {
  @Output() cancelLeave = new EventEmitter<void>();
  @Output() confirmLeave = new EventEmitter<void>();
}
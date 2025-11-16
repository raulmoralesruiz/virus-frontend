import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-room-enter',
  standalone: true,
  imports: [],
  templateUrl: './room-enter.component.html',
  styleUrl: './room-enter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomEnterComponent {
  @Input() isCreatingPlayer = false;
  @Input() creationError: string | null = null;
  @Output() creationErrorChange = new EventEmitter<string | null>();
  @Output() createPlayerAndJoin = new EventEmitter<HTMLInputElement>();
}
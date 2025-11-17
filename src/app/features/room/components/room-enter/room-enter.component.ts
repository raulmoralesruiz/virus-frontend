import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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
  isCreatingPlayer = input(false);
  creationError = input<string | null>(null);
  creationErrorChange = output<string | null>();
  createPlayerAndJoin = output<HTMLInputElement>();
}
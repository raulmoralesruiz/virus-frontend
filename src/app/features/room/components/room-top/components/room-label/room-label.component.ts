import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-room-label',
  standalone: true,
  imports: [],
  templateUrl: './room-label.component.html',
  styleUrl: './room-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomLabelComponent {
  roomName = input.required<string>();
}

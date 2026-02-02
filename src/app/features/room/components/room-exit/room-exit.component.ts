import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-room-exit',
  standalone: true,
  imports: [],
  templateUrl: './room-exit.component.html',
  styleUrl: './room-exit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomExitComponent {
  cancelLeave = output<void>();
  confirmLeave = output<void>();
}
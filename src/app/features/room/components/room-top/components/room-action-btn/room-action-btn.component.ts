import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-room-action-btn',
  standalone: true,
  imports: [],
  templateUrl: './room-action-btn.component.html',
  styleUrl: './room-action-btn.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomActionBtnComponent {
  ariaLabel = input.required<string>();
  customClass = input<string>('');
  onClick = output<void>();
}

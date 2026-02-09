import { Component, output } from '@angular/core';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';

@Component({
  selector: 'game-info-leave-button',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './game-info-leave-button.html',
  styleUrl: './game-info-leave-button.css',
})
export class GameInfoLeaveButtonComponent {
  leaveRequested = output<void>();

  onLeaveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.leaveRequested.emit();
  }
}

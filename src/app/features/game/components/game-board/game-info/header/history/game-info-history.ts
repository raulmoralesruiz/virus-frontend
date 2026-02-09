import { Component, input, output } from '@angular/core';
import { CardIconComponent } from '../../../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'game-info-history',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './game-info-history.html',
  styleUrl: './game-info-history.css',
})
export class GameInfoHistoryComponent {
  historyCount = input(0);
  historyRequested = output<void>();

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

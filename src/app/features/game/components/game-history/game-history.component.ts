import { Component, computed, input, output } from '@angular/core';
import { HistoryEntry } from '@core/models/game.model';
import { GameHistoryItemComponent } from './game-history-item/game-history-item.component';

@Component({
  selector: 'game-history',
  standalone: true,
  imports: [GameHistoryItemComponent],
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent {
  history = input<HistoryEntry[]>([]);
  closed = output<void>();

  closeHistory() {
    this.closed.emit();
  }
}

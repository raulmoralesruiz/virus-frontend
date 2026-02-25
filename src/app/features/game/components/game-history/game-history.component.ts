import { Component, computed, input, output } from '@angular/core';
import { HistoryEntry } from '@core/models/game.model';
import { parseGameHistoryTarget } from './game-history.utils';

@Component({
  selector: 'game-history',
  standalone: true,
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent {
  history = input<HistoryEntry[]>([]);
  closed = output<void>();

  parsedHistory = computed(() => {
    return this.history().map(entry => ({
      ...entry,
      parsedTarget: parseGameHistoryTarget(entry.target)
    }));
  });

  closeHistory() {
    this.closed.emit();
  }
}

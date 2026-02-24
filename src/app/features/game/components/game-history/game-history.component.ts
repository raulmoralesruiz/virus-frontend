import { Component, input, output } from '@angular/core';
import { HistoryEntry } from '@core/models/game.model';

@Component({
  selector: 'game-history',
  standalone: true,
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

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-history',
  standalone: true,
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent {
  history = input<string[]>([]);
  closed = output<void>();

  closeHistory() {
    this.closed.emit();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'game-info-header',
  standalone: true,
  templateUrl: './game-info-header.html',
  styleUrl: './game-info-header.css',
})
export class GameInfoHeaderComponent {
  @Input() roomId = '';
  @Input() showDetails = false;
  @Input() historyCount = 0;
  @Output() historyRequested = new EventEmitter<void>();

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

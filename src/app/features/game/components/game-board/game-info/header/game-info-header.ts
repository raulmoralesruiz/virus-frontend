import { Component, input, output } from '@angular/core';
import { Card } from '../../../../../../core/models/card.model';
import { GameInfoDiscardPreviewComponent } from './discard-preview/game-info-discard-preview';

@Component({
  selector: 'game-info-header',
  standalone: true,
  imports: [GameInfoDiscardPreviewComponent],
  templateUrl: './game-info-header.html',
  styleUrl: './game-info-header.css',
})
export class GameInfoHeaderComponent {
  roomId = input('');
  showDetails = input(false);
  historyCount = input(0);
  discardCount = input(0);
  topDiscard = input<Card | undefined>(undefined);
  historyRequested = output<void>();

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

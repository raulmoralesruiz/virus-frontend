import { Component, input, output } from '@angular/core';
import { Card } from '@core/models/card.model';
import { GameInfoDiscardComponent } from './discard-preview/game-info-discard';
import { GameInfoTitleComponent } from './title/game-info-title';
import { GameInfoHistoryComponent } from './history/game-info-history';

@Component({
  selector: 'game-info-header',
  standalone: true,
  imports: [
    GameInfoDiscardComponent,
    GameInfoTitleComponent,
    GameInfoHistoryComponent,
  ],
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
  /** Se emite cuando la zona de cabecera (título + descarte) se pulsa o recibe Enter/Espacio. */
  toggleRequested = output<void>();

  onToggleClick(): void {
    this.toggleRequested.emit();
  }

  onToggleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleRequested.emit();
    }
  }
}
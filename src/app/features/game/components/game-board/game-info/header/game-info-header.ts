import { Component, input, output } from '@angular/core';
import { Card } from '../../../../../../core/models/card.model';
import { GameInfoDiscardPreviewComponent } from './discard-preview/game-info-discard-preview';
import { GameInfoTitleComponent } from './title/game-info-title';
import { GameInfoHistoryComponent } from './history/game-info-history';

@Component({
  selector: 'game-info-header',
  standalone: true,
  imports: [
    GameInfoDiscardPreviewComponent,
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
}

import { Component, input, output } from '@angular/core';
import { Card } from '@core/models/card.model';
import { GameInfoDiscardComponent } from './discard-preview/game-info-discard';
import { GameInfoTitleComponent } from './title/game-info-title';
import { GameInfoHistoryComponent } from './history/game-info-history';
import { GameHelpComponent } from '../help/game-help.component';

@Component({
  selector: 'game-info-header',
  standalone: true,
  imports: [
    GameInfoDiscardComponent,
    GameInfoTitleComponent,
    GameInfoHistoryComponent,
    GameHelpComponent,
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
  /**
   * Se emite cuando la zona de cabecera (título + descarte) se activa.
   * Es un <button> nativo: click, Enter y Espacio llegan solos, sin
   * manejadores de teclado a mano.
   */
  toggleRequested = output<void>();

  onToggleClick(): void {
    this.toggleRequested.emit();
  }
}
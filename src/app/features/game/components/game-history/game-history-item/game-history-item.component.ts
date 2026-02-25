import { Component, input } from '@angular/core';
import { HistoryEntry } from '@core/models/game.model';
import { ParseTargetPipe } from '../pipes/parse-target.pipe';

@Component({
  selector: 'game-history-item',
  standalone: true,
  imports: [ParseTargetPipe],
  templateUrl: './game-history-item.component.html',
  styleUrls: ['./game-history-item.component.css']
})
export class GameHistoryItemComponent {
  entry = input.required<HistoryEntry>();
}

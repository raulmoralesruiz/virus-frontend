import { Component, input, output } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HandCard } from '../../hand-card/hand-card';
import { Card } from '@core/models/card.model';

@Component({
  selector: 'game-hand-list',
  standalone: true,
  imports: [DragDropModule, HandCard],
  templateUrl: './hand-list.component.html',
  styleUrl: './hand-list.component.css',
})
export class HandListComponent {
  hand = input.required<Card[]>();
  
  isMyTurn = input(false);
  playerId = input<string | undefined>(undefined);
  connectedTo = input<string[]>([]);
  selectedIndices = input<Set<number>>(new Set());
  selectedPlayingCardId = input<string | null | undefined>(undefined);
  mustPlayCardId = input<string | null>(null);

  exitHand = output<any>();
  toggleSelect = output<number>();
  play = output<Card>();
}

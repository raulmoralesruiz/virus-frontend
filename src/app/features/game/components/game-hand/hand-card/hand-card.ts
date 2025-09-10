import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../../../../../core/models/card.model';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [],
  templateUrl: './hand-card.html',
  styleUrl: './hand-card.css',
})
export class HandCard {
  @Input() card!: Card;
  @Input() isSelected: boolean = false;
  @Input() isMyTurn: boolean = false;

  @Output() toggleSelect = new EventEmitter<Card>();
  @Output() play = new EventEmitter<Card>();

  onToggleSelect() {
    this.toggleSelect.emit(this.card);
  }

  onPlay(event: MouseEvent) {
    event.stopPropagation(); // que no active toggleSelect al pulsar el botón
    this.play.emit(this.card);
  }
}

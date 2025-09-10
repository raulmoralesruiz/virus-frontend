// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { Card } from '../../../../core/models/card.model';
// import { HandCard } from './hand-card/hand-card';

// @Component({
//   selector: 'app-game-hand',
//   standalone: true,
//   imports: [HandCard],
//   templateUrl: './game-hand.html',
//   styleUrl: './game-hand.css',
// })
// export class GameHand {
//   @Input() hand: Card[] = [];
//   @Input() isMyTurn: boolean = false;
//   @Input() roomId!: string;

//   @Output() playCard = new EventEmitter<string>();
//   @Output() discardCards = new EventEmitter<string[]>();

//   selectedCardsToDiscard: Card[] = [];

//   toggleDiscardSelection(card: Card) {
//     const idx = this.selectedCardsToDiscard.findIndex((c) => c.id === card.id);
//     if (idx >= 0) this.selectedCardsToDiscard.splice(idx, 1);
//     else this.selectedCardsToDiscard.push(card);
//   }

//   discardSelectedCards() {
//     if (this.selectedCardsToDiscard.length === 0) return;
//     this.discardCards.emit(this.selectedCardsToDiscard.map((c) => c.id));
//     this.selectedCardsToDiscard = [];
//   }
// }

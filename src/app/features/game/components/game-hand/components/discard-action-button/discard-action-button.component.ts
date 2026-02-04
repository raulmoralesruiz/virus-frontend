import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-discard-action-button',
  standalone: true,
  templateUrl: './discard-action-button.component.html',
  styleUrl: './discard-action-button.component.css',
})
export class DiscardActionButtonComponent {
  selectedCount = input.required<number>();
  isMyTurn = input(false);
  gameEnded = input(false);
  discard = output<void>();
}

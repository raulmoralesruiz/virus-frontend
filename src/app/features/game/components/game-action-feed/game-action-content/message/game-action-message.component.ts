import { Component, computed, input } from '@angular/core';
import { GameAction } from '../../types/game-action.types';

@Component({
  selector: 'game-action-message',
  standalone: true,
  templateUrl: './game-action-message.component.html',
  styleUrl: './game-action-message.component.css',
})
export class GameActionMessageComponent {
  action = input<GameAction | null>(null);

  detail = computed(() => this.getDetail(this.action()));
  cardsLabel = computed(() => this.getCardsLabel(this.action()?.quantity));

  private getDetail(action: GameAction | null): string | null {
    if (!action?.detail) return null;
    if (action.type === 'play-card') {
      const match = action.detail.match(/^→\s*contagi(?:o|ó)\s+a\s+(?<target>.+)$/i);
      const target = match?.groups?.['target'];
      if (target) return `contra ${target.trim()}`;
    }
    return action.detail;
  }

  private getCardsLabel(quantity?: number | null): string {
    const total = quantity ?? 0;
    return total === 1 ? '1 carta' : `${total} cartas`;
  }
}

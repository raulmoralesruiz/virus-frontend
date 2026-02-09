import { Component, computed, input } from '@angular/core';
import { Card } from '../../../../../../../core/models/card.model';
import { CardIconComponent } from '../../../../../../../shared/components/card-icon/card-icon.component';
import {
  getColorThiefColor,
  getDiscardBackground,
  getDisplayImage,
} from './game-info-discard.helpers';

@Component({
  selector: 'game-info-discard',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './game-info-discard.html',
  styleUrl: './game-info-discard.css',
  host: {
    '[style.background]': 'discardBackground()',
    '[class.discard-preview--empty]': '!topDiscard()',
    '[attr.aria-label]':
      'topDiscard() ? "Última carta: " + topDiscard()!.id + ". Total descartes: " + discardCount() : "Pila de descartes vacía"',
  },
})
export class GameInfoDiscardComponent {
  topDiscard = input<Card | undefined>(undefined);
  discardCount = input(0);

  readonly displayImage = computed(() => getDisplayImage(this.topDiscard()));
  readonly colorThiefColor = computed(() =>
    getColorThiefColor(this.topDiscard())
  );
  readonly discardBackground = computed(() =>
    getDiscardBackground(this.topDiscard())
  );
}

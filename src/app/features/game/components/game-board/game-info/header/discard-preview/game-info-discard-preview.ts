import { Component, computed, input } from '@angular/core';
import { Card } from '../../../../../../../core/models/card.model';
import { CardIconComponent } from '../../../../../../../shared/components/card-icon/card-icon.component';
import {
  getColorThiefColor,
  getDiscardBackground,
  getDisplayImage,
} from './game-info-discard-preview.helpers';

@Component({
  selector: 'game-info-discard-preview',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './game-info-discard-preview.html',
  styleUrl: './game-info-discard-preview.css',
})
export class GameInfoDiscardPreviewComponent {
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


import { Component, input } from '@angular/core';

import { Card, CardKind, CardColor, TreatmentSubtype } from '@core/models/card.model';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';
import { ORGAN_ICONS, TREATMENT_ICONS } from '../constants/hand-card.constants';

@Component({
  selector: 'app-hand-card-content',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './hand-card-content.component.html',
  styleUrl: './hand-card-content.component.css',
})
export class HandCardContentComponent {
  card = input.required<Card>();

  get icon(): string {
    const card = this.card();
    const treatmentEmoji =
      card.kind === CardKind.Treatment ? this.treatmentEmoji(card.subtype) : null;
    if (treatmentEmoji) {
      return treatmentEmoji;
    }

    switch (card.kind) {
      case CardKind.Organ:
        return ORGAN_ICONS[card.color] ?? '❔';
      case CardKind.Medicine:
        return 'modifier-medicine';
      case CardKind.Virus:
        return 'modifier-virus';
      case CardKind.Treatment:
        return '🧪';
      default:
        return '❔';
    }
  }

  get subtypeIconName(): string | null {
    const card = this.card();
    if (card.kind !== CardKind.Treatment || !card.subtype) return null;
    const iconName = TREATMENT_ICONS[card.subtype];
    if (iconName?.startsWith('emoji:')) {
      return null;
    }
    return iconName || null;
  }

  get displayImage(): string | null {
    if (this.subtypeIconName) {
      return this.subtypeIconName;
    }
    const icon = this.icon;
    if (
      icon.startsWith('organ-') || 
      icon.startsWith('modifier-') || 
      icon.startsWith('treatment-')
    ) {
      return icon;
    }
    return null;
  }

  get colorThiefColor(): string | null {
    const card = this.card();
    switch (card.subtype) {
      case TreatmentSubtype.colorThiefRed:
        return 'var(--card-red)';
      case TreatmentSubtype.colorThiefGreen:
        return 'var(--card-green)';
      case TreatmentSubtype.colorThiefBlue:
        return 'var(--card-blue)';
      case TreatmentSubtype.colorThiefYellow:
        return 'var(--card-yellow)';
      default:
        return null;
    }
  }

  private treatmentEmoji(subtype: TreatmentSubtype | undefined): string | null {
    if (!subtype) return null;
    const icon = TREATMENT_ICONS[subtype];
    if (icon?.startsWith('emoji:')) {
      return icon.slice('emoji:'.length);
    }
    return null;
  }
}

import { Component, input, output, effect } from '@angular/core';
import { Card } from '../../../../../../core/models/card.model';
import { CardIconComponent } from '../../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'game-info-header',
  standalone: true,
  imports: [CardIconComponent],
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

  constructor() {
    effect(() => {
      const card = this.topDiscard();
    });
  }

  get displayImage(): string | null {
    const card = this.topDiscard();
    if (!card) return null;

    if (this.subtypeIconName) {
      return this.subtypeIconName;
    }

    if (card.kind === 'organ') {
      const icon = this.organIcons[card.color];
      return icon || null;
    }

    if (card.kind === 'medicine') return 'modifier-medicine';
    if (card.kind === 'virus') return 'modifier-virus';
    
    return null;
  }

  get colorThiefColor(): string | null {
    const card = this.topDiscard();
    if (!card || card.kind !== 'treatment' || !card.subtype) return null;

    switch (card.subtype) {
      case 'colorThiefRed':
        return 'var(--card-red-end)';
      case 'colorThiefGreen':
        return 'var(--card-green-end)';
      case 'colorThiefBlue':
        return 'var(--card-blue-end)';
      case 'colorThiefYellow':
        return 'var(--card-yellow-end)';
      default:
        return null;
    }
  }

  get subtypeIconName(): string | null {
    const card = this.topDiscard();
    if (!card || card.kind !== 'treatment' || !card.subtype) return null;
    const iconName = this.treatmentIcons[card.subtype];
    if (iconName?.startsWith('emoji:')) return null;
    return iconName || null;
  }

  private readonly organIcons: Record<string, string> = {
    'red': 'organ-red', // ❤️
    'green': 'organ-green', // 🫃
    'blue': 'organ-blue', // 🧠
    'yellow': 'organ-yellow', // 🦴
    'multi': 'organ-multi', // 🌈
    'halloween': 'organ-halloween', // 🎃
    'orange': 'organ-orange', // Órgano Mutante
  };

  // Keep in sync with HandCard
  private readonly treatmentIcons: Record<string, string> = {
    'transplant': 'treatment-transplant',
    'organThief': 'treatment-organThief',
    'contagion': 'treatment-contagion',
    'gloves': 'treatment-gloves',
    'medicalError': 'treatment-medicalError',
    'failedExperiment': 'treatment-failedExperiment',
    'trickOrTreat': 'treatment-trickOrTreat',
    'colorThiefRed': 'treatment-colorThief',
    'colorThiefGreen': 'treatment-colorThief',
    'colorThiefBlue': 'treatment-colorThief',
    'colorThiefYellow': 'treatment-colorThief',
    'bodySwap': 'treatment-bodySwap',
    'apparition': 'treatment-apparition',
    'alienTransplant': 'treatment-alienTransplant',
  };
  get discardBackground(): string {
    const card = this.topDiscard();
    if (!card) return 'transparent';

    // Treatment -> Multi (Purple) - Solid
    if (card.kind === 'treatment' && card.color === 'treatment') {
      return 'var(--card-multi-middle)';
    }

    // Halloween treatment -> Multi (Purple Orange) - Solid (Orange dominant)
    if (card.kind === 'treatment' && card.color === 'halloween') {
      return 'linear-gradient(135deg, var(--card-multi-middle) 80%, var(--card-halloween-end))';
    }

    // Mutant Organ (Orange) -> Halloween (Orange) - Solid
    if (card.kind === 'organ' && card.color === 'orange') {
      return 'var(--card-halloween-end)';
    }

    // Multi -> Multi (5 colors) - KEEP GRADIENT
    if (card.color === 'multi') {
      return 'linear-gradient(135deg, var(--organ-red), var(--organ-blue), var(--organ-green), var(--organ-yellow), var(--organ-orange))';
    }

    // Organo, medicina o virus (Red, Green, Blue, Yellow) - Solid
    if (card.kind === 'organ' || card.kind === 'medicine' || card.kind === 'virus') {
      return `var(--card-${card.color}-end)`;
    }

    return 'transparent';
  }

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

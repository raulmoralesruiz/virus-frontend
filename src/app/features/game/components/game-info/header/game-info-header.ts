import { Component, input, output, effect } from '@angular/core';
import { Card } from '../../../../../core/models/card.model';

@Component({
  selector: 'game-info-header',
  standalone: true,
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

    if (this.subtypeImagePath) {
      return this.subtypeImagePath;
    }

    if (card.kind === 'organ') {
      const icon = this.organIcons[card.color];
      return icon?.includes('/') ? icon : null;
    }

    if (card.kind === 'medicine') return 'assets/modifiers/medicine.svg';
    if (card.kind === 'virus') return 'assets/modifiers/virus.svg';
    
    // Fallback if treatment has no subtype but we need an image? 
    // Usually treatments have subtypes. If generic treatment existed it would need an asset.
    // For now assuming subtype covers treatments.
    
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

  get subtypeImagePath(): string | null {
    const card = this.topDiscard();
    if (!card || card.kind !== 'treatment' || !card.subtype) return null;
    const iconFile = this.treatmentIcons[card.subtype];
    if (iconFile?.startsWith('emoji:')) return null;
    return iconFile ? `assets/treatment/${iconFile}` : null;
  }

  // Removed generalImagePath as it is merged into displayImage

  private readonly organIcons: Record<string, string> = {
    'red': 'assets/organs/red.svg', // ❤️
    'green': 'assets/organs/green.svg', // 🫃
    'blue': 'assets/organs/blue.svg', // 🧠
    'yellow': 'assets/organs/yellow.svg', // 🦴
    'multi': 'assets/organs/multi.svg', // 🌈
    'halloween': 'assets/organs/halloween.svg', // 🎃
    'orange': 'assets/organs/orange.svg', // Órgano Mutante
  };

  // Keep in sync with HandCard
  private readonly treatmentIcons: Record<string, string> = {
    'transplant': 'transplant.svg',
    'organThief': 'organThief.svg',
    'contagion': 'contagion.svg',
    'gloves': 'gloves.svg',
    'medicalError': 'medicalError.svg',
    'failedExperiment': 'failedExperiment.svg',
    'trickOrTreat': 'trickOrTreat.svg',
    'colorThiefRed': 'colorThief.svg',
    'colorThiefGreen': 'colorThief.svg',
    'colorThiefBlue': 'colorThief.svg',
    'colorThiefYellow': 'colorThief.svg',
    'bodySwap': 'bodySwap.svg',
    'apparition': 'apparition.svg',
    'alienTransplant': 'alienTransplant.svg',
  };
  get discardBackground(): string {
    const card = this.topDiscard();
    if (!card) return 'transparent';

    // Treatment -> Multi (Purple)
    if (card.kind === 'treatment' && card.color === 'treatment') {
      return 'linear-gradient(145deg, var(--card-multi-start) 0%, var(--card-multi-middle) 45%, var(--card-multi-end) 100%)';
    }

    // Halloween treatment -> Multi (Purple Orange)
    if (card.kind === 'treatment' && card.color === 'halloween') {
       return 'linear-gradient(135deg, var(--card-multi-start) 30%, var(--card-halloween-end) 70%)';
    }

    // Mutant Organ (Orange) -> Halloween (Orange)
    if (card.kind === 'organ' && card.color === 'orange') {
      return 'linear-gradient(180deg, var(--card-halloween-start) 0%, var(--card-halloween-end) 100%)';
    }

    // Multi -> Multi (5 colors)
    if (card.color === 'multi') {
      return 'linear-gradient(135deg, var(--organ-red), var(--organ-blue), var(--organ-green), var(--organ-yellow), var(--organ-orange))';
    }

    // Organo, medicina o virus 
    if (card.kind === 'organ' || card.kind === 'medicine' || card.kind === 'virus') {
      return 'linear-gradient(180deg, var(--card-' + card.color + '-start) 0%, var(--card-' + card.color + '-end) 100%)';
    }

    return 'transparent';
  }

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

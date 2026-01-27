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

  get topDiscardIcon(): string | null {
    const card = this.topDiscard();
    if (!card) return '∅';

    if (card.kind === 'treatment' && card.subtype) {
      if (this.treatmentIcons[card.subtype]?.startsWith('emoji:')) {
        return this.treatmentIcons[card.subtype].slice(6);
      }
      return null; // It's an image
    }

    if (card.kind === 'organ') {
      const icon = this.organIcons[card.color];
      if (icon?.includes('/')) return null; // Image path, handled by subtypeImagePath (or need new getter)
      return icon ?? '❔';
    }

    // Medicine and Virus now have SVGs handled by generalImagePath
    if (card.kind === 'medicine' || card.kind === 'virus') {
      return null;
    }

    switch (card.kind) {
      case 'treatment':
        return '🧪';
      default:
        return '❔';
    }
  }

  get colorThiefColor(): string | null {
    const card = this.topDiscard();
    if (!card || card.kind !== 'treatment' || !card.subtype) return null;

    switch (card.subtype) {
      case 'colorThiefRed':
        return 'var(--organ-red)';
      case 'colorThiefGreen':
        return 'var(--organ-green)';
      case 'colorThiefBlue':
        return 'var(--organ-blue)';
      case 'colorThiefYellow':
        return 'var(--organ-yellow)';
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

  get generalImagePath(): string | null {
    const card = this.topDiscard();
    if (!card) return null;

    if (card.kind === 'organ') {
      const icon = this.organIcons[card.color];
      return icon?.includes('/') ? icon : null;
    }

    if (card.kind === 'medicine') return 'assets/modifiers/medicine.svg';
    if (card.kind === 'virus') return 'assets/modifiers/virus.svg';

    return null;
  }

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
  get discardBackgroundColor(): string {
    const card = this.topDiscard();
    if (!card) return 'transparent';

    // Halloween Treatment -> Multi (Purple)
    if (card.kind === 'treatment' && card.color === 'halloween') {
      return 'var(--organ-multi)';
    }

    // Mutant Organ (Orange) -> Halloween (Orange)
    if (card.kind === 'organ' && card.color === 'orange') {
      return 'var(--organ-halloween)';
    }

    return 'var(--organ-' + card.color + ')';
  }

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }
}

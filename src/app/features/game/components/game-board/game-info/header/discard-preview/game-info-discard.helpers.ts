import { Card } from '../../../../../../../core/models/card.model';
import { ORGAN_ICONS, TREATMENT_ICONS } from './game-info-discard.constants';

export function getSubtypeIconName(card: Card): string | null {
  if (card.kind !== 'treatment' || !card.subtype) return null;
  const iconName = TREATMENT_ICONS[card.subtype];
  if (iconName?.startsWith('emoji:')) return null;
  return iconName || null;
}

export function getDisplayImage(card: Card | undefined): string | null {
  if (!card) return null;

  const subtypeIcon = getSubtypeIconName(card);
  if (subtypeIcon) {
    return subtypeIcon;
  }

  if (card.kind === 'organ') {
    const icon = ORGAN_ICONS[card.color];
    return icon || null;
  }

  if (card.kind === 'medicine') return 'modifier-medicine';
  if (card.kind === 'virus') return 'modifier-virus';

  return null;
}

export function getColorThiefColor(card: Card | undefined): string | null {
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

export function getDiscardBackground(card: Card | undefined): string {
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

import { PlayCardTarget } from '@core/models/game.model';
import { TargetSelectOption } from './target-select.models';
import { COLOR_LABELS } from './target-select.constants';
export { getCardEffectDescription, getCardKindLabel, getCardColorLabel, getCardSubtypeLabel } from './target-select.descriptions';

export { getInstruction } from './target-select.instructions';
export { getRequiresTargetSelection } from './target-select.predicates';

export function toOptionValue(target?: PlayCardTarget | TargetSelectOption | null): string {
  return target ? `${target.organId}|${target.playerId}` : '';
}

export function organColorClass(color?: string): string {
  switch (color) {
    case 'red': return 'color-dot--red';
    case 'green': return 'color-dot--green';
    case 'blue': return 'color-dot--blue';
    case 'yellow': return 'color-dot--yellow';
    case 'multi': return 'color-dot--multi';
    default: return 'color-dot--neutral';
  }
}

export function organColorLabel(color?: string): string {
    return COLOR_LABELS[color || ''] || color || 'Sin órgano';
}


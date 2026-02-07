import { Card, CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';
import { TargetSelectOption, PlayerOption } from './target-select.models';
import { toOptionValue } from './target-select.utils';

export function filterTargetOptions(options: TargetSelectOption[], card: Card, myPlayerId?: string, myOrganColors: string[] = []): TargetSelectOption[] {
    if (card.kind !== CardKind.Treatment) return options;
    
    // Logic for Color Thief
    const colorMap: Partial<Record<TreatmentSubtype, string>> = {
        [TreatmentSubtype.colorThiefRed]: 'red',
        [TreatmentSubtype.colorThiefGreen]: 'green',
        [TreatmentSubtype.colorThiefBlue]: 'blue',
        [TreatmentSubtype.colorThiefYellow]: 'yellow',
    };

    const requiredColor = card.subtype ? colorMap[card.subtype] : null;
    if (requiredColor) {
        return options.filter(opt => opt.organColor === requiredColor && opt.playerId !== myPlayerId);
    }

    // Logic for Organ Thief (stealing any organ)
    if (card.subtype === TreatmentSubtype.OrganThief) {
        return options.filter(opt => 
            opt.playerId !== myPlayerId && 
            (!opt.organColor || !myOrganColors.includes(opt.organColor))
        );
    }

    return options;
}

export function getPlayerOptions(options: TargetSelectOption[]): PlayerOption[] {
    const players = new Map<string, string>();
    for (const option of options) {
      if (option.playerId && option.playerName && !players.has(option.playerId)) {
          players.set(option.playerId, option.playerName);
      }
    }
    return Array.from(players, ([id, name]) => ({ id, name }));
}

export function getOrgansForPlayer(options: TargetSelectOption[], playerId: string): TargetSelectOption[] {
    if (!playerId) return [];
    return options.filter((o) => o.playerId === playerId && !!o.organId);
}

export function shouldClearSelection(
    options: TargetSelectOption[], 
    playerId: string, 
    currentSelection: string
): boolean {
    if (!playerId) return true;
    const organs = getOrgansForPlayer(options, playerId);
    return !organs.length || !organs.some((opt) => toOptionValue(opt) === currentSelection);
}

export function hasNoOptionsAvailable(
    isPlayerOnly: boolean, 
    isBodySwap: boolean, 
    requiresSingleTarget: boolean, 
    playerOptionsCount: number, 
    targetOptionsCount: number
): boolean {
    if (isPlayerOnly) return playerOptionsCount === 0;
    if (isBodySwap) return false;
    if (requiresSingleTarget) return playerOptionsCount === 0 || targetOptionsCount === 0;
    return false;
}

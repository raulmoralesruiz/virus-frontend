import { Card, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { TargetSelectOption } from './target-select.models';
import { filterTargetOptions, getPlayerOptions, getOrgansForPlayer, shouldClearSelection, hasNoOptionsAvailable } from './target-select.logic';

describe('TargetSelectLogic', () => {
    describe('filterTargetOptions', () => {
        const myPlayerId = 'p1';
        const myOrganColors = ['red'];
        
        it('should filter targets for Color Thief (e.g. Red)', () => {
            const card: Card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as any;
            const options: TargetSelectOption[] = [
                { playerId: 'p2', organColor: 'red', organId: 'o1' },
                { playerId: 'p2', organColor: 'blue', organId: 'o2' },
                { playerId: 'p1', organColor: 'red', organId: 'o3' }, // should be excluded (is me)
            ];
            const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
            expect(result).toEqual([{ playerId: 'p2', organColor: 'red', organId: 'o1' }]);
        });

        it('should filter targets for Organ Thief (exclude me and my colors)', () => {
            const card: Card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as any;
            const options: TargetSelectOption[] = [
                { playerId: 'p2', organColor: 'blue', organId: 'o1' },
                { playerId: 'p2', organColor: 'red', organId: 'o2' }, // should be excluded (I have red)
                { playerId: 'p1', organColor: 'green', organId: 'o3' }, // should be excluded (is me)
            ];
            const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
            expect(result).toEqual([{ playerId: 'p2', organColor: 'blue', organId: 'o1' }]);
        });

        it('should not filter for other Treatment cards', () => {
            const card: Card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any;
            const options: TargetSelectOption[] = [{ playerId: 'p2', organColor: 'blue', organId: 'o1' }];
            const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
            expect(result).toEqual(options);
        });

        it('should not filter for multicolor Virus/Medicine', () => {
             const card: Card = { kind: CardKind.Virus, color: 'multi' } as any;
             const options: TargetSelectOption[] = [{ playerId: 'p2', organColor: 'blue', organId: 'o1' }];
             const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
             expect(result).toEqual(options);
        });

        it('should filter Virus/Medicine by color or multicolor target', () => {
             const card: Card = { kind: CardKind.Medicine, color: 'red' } as any;
             const options: TargetSelectOption[] = [
                 { playerId: 'p2', organColor: 'blue', organId: 'o1' },
                 { playerId: 'p2', organColor: 'red', organId: 'o2' },
                 { playerId: 'p2', organColor: 'multi', organId: 'o3' },
             ];
             const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
             expect(result).toEqual([
                 { playerId: 'p2', organColor: 'red', organId: 'o2' },
                 { playerId: 'p2', organColor: 'multi', organId: 'o3' },
             ]);
        });
        
        it('should not filter target options for Organs', () => {
            const card: Card = { kind: CardKind.Organ, color: 'red' } as any;
            const options: TargetSelectOption[] = [{ playerId: 'p1', organColor: 'red', organId: 'o1' }];
            const result = filterTargetOptions(options, card, myPlayerId, myOrganColors);
            expect(result).toEqual(options);
        });
        
        it('should handle undefined myOrganColors', () => {
             const card: Card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as any;
             const options: TargetSelectOption[] = [{ playerId: 'p2', organColor: 'blue', organId: 'o1' }];
             expect(filterTargetOptions(options, card, myPlayerId)).toEqual(options);
        });

        it('should handle missing card subtype', () => {
            const noSubtypeCard: Card = { kind: CardKind.Treatment } as any;
            const options: TargetSelectOption[] = [{ playerId: 'p2', organColor: 'blue', organId: 'o1' }];
            expect(filterTargetOptions(options, noSubtypeCard, myPlayerId)).toEqual(options);
        });
    });

    describe('getPlayerOptions', () => {
        it('should extract unique players from options', () => {
            const options: TargetSelectOption[] = [
                { playerId: 'p1', playerName: 'Player 1', organId: 'o1' },
                { playerId: 'p1', playerName: 'Player 1', organId: 'o2' },
                { playerId: 'p2', playerName: 'Player 2', organId: 'o3' },
                { organId: 'o4' } // no player
            ];
            const result = getPlayerOptions(options);
            expect(result).toEqual([
                { id: 'p1', name: 'Player 1' },
                { id: 'p2', name: 'Player 2' }
            ]);
        });
    });

    describe('getOrgansForPlayer', () => {
        it('should return organs for specific player', () => {
            const options: TargetSelectOption[] = [
                { playerId: 'p1', organId: 'o1' },
                { playerId: 'p1', organId: 'o2' },
                { playerId: 'p2', organId: 'o3' },
                { playerId: 'p1' } // no organId
            ];
            expect(getOrgansForPlayer(options, 'p1')).toEqual([
                { playerId: 'p1', organId: 'o1' },
                { playerId: 'p1', organId: 'o2' }
            ]);
            expect(getOrgansForPlayer(options, '')).toEqual([]);
        });
    });

    describe('shouldClearSelection', () => {
        it('should return true if playerId is falsy', () => {
            expect(shouldClearSelection([], '', '')).toBe(true);
        });

        it('should return true if player has no organs', () => {
            expect(shouldClearSelection([], 'p1', 'o1')).toBe(true);
        });

        it('should return true if current selection is not among player organs', () => {
            const options: TargetSelectOption[] = [{ playerId: 'p1', organId: 'o2' }];
            expect(shouldClearSelection(options, 'p1', 'o1|p1')).toBe(true);
        });

        it('should return false if current selection is among player organs', () => {
            const options: TargetSelectOption[] = [{ playerId: 'p1', organId: 'o1' }];
            expect(shouldClearSelection(options, 'p1', 'o1|p1')).toBe(false);
        });
    });

    describe('hasNoOptionsAvailable', () => {
        it('should return true if playerOnly and no players', () => {
            expect(hasNoOptionsAvailable(true, false, false, 0, 10)).toBe(true);
            expect(hasNoOptionsAvailable(true, false, false, 1, 10)).toBe(false);
        });

        it('should return false if bodySwap', () => {
            expect(hasNoOptionsAvailable(false, true, false, 0, 0)).toBe(false);
        });

        it('should evaluate single target correctly', () => {
            expect(hasNoOptionsAvailable(false, false, true, 0, 10)).toBe(true);
            expect(hasNoOptionsAvailable(false, false, true, 2, 0)).toBe(true);
            expect(hasNoOptionsAvailable(false, false, true, 2, 2)).toBe(false);
        });
        
        it('should return false for none of above', () => {
            expect(hasNoOptionsAvailable(false, false, false, 0, 0)).toBe(false);
        });
    });
});

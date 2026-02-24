import { CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';
import * as predicates from './target-select.predicates';

describe('TargetSelectPredicates', () => {
    describe('isTransplantCard', () => {
        it('should return true for transplant and alien transplant', () => {
             expect(predicates.isTransplantCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any)).toBe(true);
             expect(predicates.isTransplantCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.AlienTransplant } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isTransplantCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toBe(false);
             expect(predicates.isTransplantCard({ kind: CardKind.Organ } as any)).toBe(false);
        });
    });

    describe('isContagionCard', () => {
        it('should return true for contagion', () => {
             expect(predicates.isContagionCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isContagionCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any)).toBe(false);
        });
    });

    describe('isFailedExperimentCard', () => {
        it('should return true for failed experiment', () => {
             expect(predicates.isFailedExperimentCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.failedExperiment } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isFailedExperimentCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toBe(false);
        });
    });

    describe('isPlayerOnlyCard', () => {
        it('should return true for medical error and trick or treat', () => {
             expect(predicates.isPlayerOnlyCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as any)).toBe(true);
             expect(predicates.isPlayerOnlyCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isPlayerOnlyCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toBe(false);
        });
    });

    describe('isBodySwapCard', () => {
        it('should return true for body swap', () => {
             expect(predicates.isBodySwapCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.BodySwap } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isBodySwapCard({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toBe(false);
        });
    });

    describe('isSelfTargetCard', () => {
        it('should return true for orange organ', () => {
             expect(predicates.isSelfTargetCard({ kind: CardKind.Organ, color: CardColor.Orange } as any)).toBe(true);
        });
        it('should return false for others', () => {
             expect(predicates.isSelfTargetCard({ kind: CardKind.Organ, color: CardColor.Red } as any)).toBe(false);
             expect(predicates.isSelfTargetCard({ kind: CardKind.Treatment } as any)).toBe(false);
        });
    });

    describe('getRequiresTargetSelection', () => {
        it('should return true for target requiring treatment cards', () => {
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any)).toBe(true);
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as any)).toBe(true);
        });
        it('should return false for non-target requiring treatment cards', () => {
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Treatment, subtype: 'other' } as any)).toBe(false);
        });
        it('should return true for orange organ', () => {
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Organ, color: CardColor.Orange } as any)).toBe(true);
        });
        it('should return true for viruses and medicines', () => {
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Virus } as any)).toBe(true);
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Medicine } as any)).toBe(true);
        });
        it('should return false for other organs', () => {
             expect(predicates.getRequiresTargetSelection({ kind: CardKind.Organ, color: CardColor.Red } as any)).toBe(false);
        });
    });
});

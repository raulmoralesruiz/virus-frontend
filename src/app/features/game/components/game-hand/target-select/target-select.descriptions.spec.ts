import { CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';
import * as descriptions from './target-select.descriptions';

describe('TargetSelectDescriptions', () => {
    describe('getCardKindLabel', () => {
        it('should return correct label', () => {
            expect(descriptions.getCardKindLabel({ kind: CardKind.Organ } as any)).toBe('Órgano');
            expect(descriptions.getCardKindLabel({ kind: CardKind.Virus } as any)).toBe('Virus');
            expect(descriptions.getCardKindLabel({ kind: CardKind.Medicine } as any)).toBe('Medicina');
            expect(descriptions.getCardKindLabel({ kind: CardKind.Treatment } as any)).toBe('Tratamiento');
        });
    });

    describe('getCardColorLabel', () => {
        it('should return associated string color label', () => {
             expect(descriptions.getCardColorLabel({ color: 'red' } as any)).toBe('Corazón');
             expect(descriptions.getCardColorLabel({ color: CardColor.Orange } as any)).toBe('Mutante');
             expect(descriptions.getCardColorLabel({ color: 'multi' } as any)).toBe('Multicolor');
             expect(descriptions.getCardColorLabel({ color: 'unknown' } as any)).toBe('unknown');
        });
    });

    describe('getCardSubtypeLabel', () => {
        it('should return label for treatment', () => {
             expect(descriptions.getCardSubtypeLabel({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any)).toBe('Trasplante');
             expect(descriptions.getCardSubtypeLabel({ kind: CardKind.Treatment, subtype: 'unknown' } as any)).toBe('unknown');
        });
        it('should return null for non-treatment or missing subtype', () => {
             expect(descriptions.getCardSubtypeLabel({ kind: CardKind.Organ } as any)).toBeNull();
             expect(descriptions.getCardSubtypeLabel({ kind: CardKind.Treatment } as any)).toBeNull();
        });
    });

    describe('getCardEffectDescription', () => {
        it('should return organ desc', () => {
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Organ } as any)).toContain('Añade este órgano');
        });
        it('should return virus desc', () => {
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Virus } as any)).toContain('Infecta un órgano');
        });
        it('should return medicine desc', () => {
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Medicine } as any)).toContain('Cura un órgano');
        });
        it('should return treatment desc', () => {
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as any)).toContain('Intercambia dos');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as any)).toContain('Roba un');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as any)).toContain('Traslada tus');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Gloves } as any)).toContain('Obliga a todos');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as any)).toContain('Intercambia por');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as any)).toContain('Maldecirás');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.failedExperiment } as any)).toContain('Actúa como un');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.BodySwap } as any)).toContain('Todos los');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Apparition } as any)).toContain('Roba la carta');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: TreatmentSubtype.AlienTransplant } as any)).toContain('incluso órganos inmunes');
             expect(descriptions.getCardEffectDescription({ kind: CardKind.Treatment, subtype: 'other' } as any)).toContain('Aplica un efecto');
        });
        it('should fallback for other kinds', () => {
             expect(descriptions.getCardEffectDescription({ kind: 'other' } as any)).toContain('Aplica un efecto');
        });
    });
});

import { getSubtypeIconName, getDisplayImage, getColorThiefColor, getDiscardBackground } from './game-info-discard.helpers';
import { Card, CardKind, CardColor, TreatmentSubtype } from '@core/models/card.model';
import { TREATMENT_ICONS } from './game-info-discard.constants';

describe('game-info-discard.helpers', () => {
  describe('getSubtypeIconName', () => {
    it('should return null if the mapped icon starts with emoji:', () => {
      TREATMENT_ICONS['testEmoji' as any] = 'emoji:🤡';
      const card = { kind: CardKind.Treatment, subtype: 'testEmoji' as any } as Card;
      expect(getSubtypeIconName(card)).toBeNull();
    });

    it('should return the icon name if it does not start with emoji', () => {
      const card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card;
      expect(getSubtypeIconName(card)).toBe('treatment-transplant');
    });

    it('should return null if the subtype does not map to any icon', () => {
      const card = { kind: CardKind.Treatment, subtype: 'unknown' as any } as Card;
      expect(getSubtypeIconName(card)).toBeNull();
    });
  });

  describe('getDisplayImage', () => {
    it('should return null if organ color does not map to a recognized icon', () => {
      const card = { kind: CardKind.Organ, color: 'unknown' as any } as Card;
      expect(getDisplayImage(card)).toBeNull();
    });

    it('should return medicine icon for medicine', () => {
      const card = { kind: CardKind.Medicine } as Card;
      expect(getDisplayImage(card)).toBe('modifier-medicine');
    });

    it('should return virus icon for virus', () => {
      const card = { kind: CardKind.Virus } as Card;
      expect(getDisplayImage(card)).toBe('modifier-virus');
    });

    it('should return null for unknown kinds', () => {
      const card = { kind: 'unknown' as any } as Card;
      expect(getDisplayImage(card)).toBeNull();
    });
  });

  describe('getColorThiefColor', () => {
    it('should map colorThief treatments to variables', () => {
        const createThief = (subtype: TreatmentSubtype) => ({ kind: CardKind.Treatment, subtype } as Card);
        expect(getColorThiefColor(createThief(TreatmentSubtype.colorThiefRed))).toBe('var(--card-red)');
        expect(getColorThiefColor(createThief(TreatmentSubtype.colorThiefGreen))).toBe('var(--card-green)');
        expect(getColorThiefColor(createThief(TreatmentSubtype.colorThiefBlue))).toBe('var(--card-blue)');
        expect(getColorThiefColor(createThief(TreatmentSubtype.colorThiefYellow))).toBe('var(--card-yellow)');
    });

    it('should return null for other treatments', () => {
        const card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card;
        expect(getColorThiefColor(card)).toBeNull();
    });

    it('should return null for non-treatments', () => {
      expect(getColorThiefColor({ kind: CardKind.Organ } as Card)).toBeNull();
      expect(getColorThiefColor(undefined)).toBeNull();
    });
  });

  describe('getDiscardBackground', () => {
    it('should return var for halloween treatment', () => {
      expect(getDiscardBackground({ kind: CardKind.Treatment, color: CardColor.Halloween } as Card)).toBe('var(--card-treatment-halloween)');
    });

    it('should return var for orange mutant organ', () => {
      expect(getDiscardBackground({ kind: CardKind.Organ, color: CardColor.Orange } as Card)).toBe('var(--card-orange)');
    });

    it('should return var for multi colored card', () => {
      expect(getDiscardBackground({ kind: CardKind.Virus, color: CardColor.Multi } as Card)).toBe('var(--card-multi)');
    });

    it('should return transparent for unhandled properties', () => {
      expect(getDiscardBackground({ kind: 'unknown', color: 'unknown' } as any)).toBe('transparent');
    });
  });
});

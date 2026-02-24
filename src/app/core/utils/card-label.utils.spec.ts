import { Card, CardColor, CardKind, TreatmentSubtype } from '../models/card.model';
import {
  describeColor,
  describeOrgan,
  describeCard,
  articleForCard,
  cardWithArticle,
  organWithArticle,
  CARD_COLOR_LABELS,
  CARD_KIND_LABELS,
  TREATMENT_LABELS
} from './card-label.utils';

describe('Card Label Utils', () => {

  describe('describeColor', () => {
    it('should return the correct label for a known color', () => {
      expect(describeColor(CardColor.Red)).toBe('Corazón');
    });

    it('should return the color value itself for an unknown color', () => {
      expect(describeColor('Unknown' as CardColor)).toBe('Unknown');
    });
  });

  describe('describeOrgan', () => {
    it('should format organ label correctly', () => {
      expect(describeOrgan(CardColor.Green)).toBe('Órgano Estómago');
    });
  });

  describe('describeCard', () => {
    it('should format Organ correctly', () => {
      const card = { kind: CardKind.Organ, color: CardColor.Blue } as Card;
      expect(describeCard(card)).toBe('Órgano Cerebro');
    });

    it('should format Virus correctly', () => {
      const card = { kind: CardKind.Virus, color: CardColor.Yellow } as Card;
      expect(describeCard(card)).toBe('Virus Hueso');
    });

    it('should format Medicine correctly', () => {
      const card = { kind: CardKind.Medicine, color: CardColor.Red } as Card;
      expect(describeCard(card)).toBe('Medicina Corazón');
    });

    it('should format Treatment correctly with known subtype', () => {
      const card = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      expect(describeCard(card)).toBe('Contagio');
    });

    it('should format Treatment correctly with unknown subtype', () => {
      const card = { kind: CardKind.Treatment, subtype: 'FakeSubtype' as TreatmentSubtype } as Card;
      expect(describeCard(card)).toBe('Tratamiento');
    });

    it('should format Treatment correctly without subtype', () => {
      const card = { kind: CardKind.Treatment } as Card;
      expect(describeCard(card)).toBe('Tratamiento');
    });

    it('should format unknown kind as "Carta"', () => {
      const card = { kind: 'UnknownKind' as CardKind } as Card;
      expect(describeCard(card)).toBe('Carta');
    });
  });

  describe('articleForCard', () => {
    it('should return La for Medicine', () => {
      expect(articleForCard({ kind: CardKind.Medicine } as Card)).toBe('La');
    });

    it('should return El for others', () => {
      expect(articleForCard({ kind: CardKind.Organ } as Card)).toBe('El');
      expect(articleForCard({ kind: CardKind.Virus } as Card)).toBe('El');
      expect(articleForCard({ kind: CardKind.Treatment } as Card)).toBe('El');
    });
  });

  describe('cardWithArticle', () => {
    it('should combine article and description', () => {
      const card = { kind: CardKind.Medicine, color: CardColor.Red } as Card;
      expect(cardWithArticle(card)).toBe('La Medicina Corazón');
    });
  });

  describe('organWithArticle', () => {
    it('should format lower-case "el" by default', () => {
      expect(organWithArticle(CardColor.Green)).toBe('el Órgano Estómago');
    });

    it('should format capital "El" if options.capitalize is true', () => {
      expect(organWithArticle(CardColor.Green, { capitalize: true })).toBe('El Órgano Estómago');
    });

    it('should format lower-case "el" if options.capitalize is false', () => {
      expect(organWithArticle(CardColor.Green, { capitalize: false })).toBe('el Órgano Estómago');
    });
  });
});

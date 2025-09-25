import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../models/card.model';

export const CARD_COLOR_LABELS: Record<CardColor, string> = {
  [CardColor.Red]: 'Corazón',
  [CardColor.Green]: 'Estómago',
  [CardColor.Blue]: 'Cerebro',
  [CardColor.Yellow]: 'Hueso',
  [CardColor.Multi]: 'Multicolor',
};

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  [CardKind.Organ]: 'Órgano',
  [CardKind.Virus]: 'Virus',
  [CardKind.Medicine]: 'Medicina',
  [CardKind.Treatment]: 'Tratamiento',
};

export const TREATMENT_LABELS: Partial<Record<TreatmentSubtype, string>> = {
  [TreatmentSubtype.Transplant]: 'Trasplante',
  [TreatmentSubtype.OrganThief]: 'Ladrón de Órganos',
  [TreatmentSubtype.Contagion]: 'Contagio',
  [TreatmentSubtype.Gloves]: 'Guantes de Látex',
  [TreatmentSubtype.MedicalError]: 'Error Médico',
};

export const describeColor = (color: CardColor): string => {
  return CARD_COLOR_LABELS[color] ?? color;
};

export const describeOrgan = (color: CardColor): string => {
  return `${CARD_KIND_LABELS[CardKind.Organ]} ${describeColor(color)}`;
};

export const describeCard = (card: Card): string => {
  switch (card.kind) {
    case CardKind.Organ:
      return describeOrgan(card.color);
    case CardKind.Virus:
      return `${CARD_KIND_LABELS[CardKind.Virus]} ${describeColor(card.color)}`;
    case CardKind.Medicine:
      return `${CARD_KIND_LABELS[CardKind.Medicine]} ${describeColor(card.color)}`;
    case CardKind.Treatment: {
      if (card.subtype) {
        return TREATMENT_LABELS[card.subtype] ?? CARD_KIND_LABELS[CardKind.Treatment];
      }
      return CARD_KIND_LABELS[CardKind.Treatment];
    }
    default:
      return 'Carta';
  }
};

export const articleForCard = (card: Card): 'El' | 'La' => {
  return card.kind === CardKind.Medicine ? 'La' : 'El';
};

export const cardWithArticle = (card: Card): string => {
  return `${articleForCard(card)} ${describeCard(card)}`;
};

export const organWithArticle = (
  color: CardColor,
  options?: { capitalize?: boolean }
): string => {
  const capitalize = options?.capitalize ?? false;
  const article = capitalize ? 'El' : 'el';
  return `${article} ${describeOrgan(color)}`;
};

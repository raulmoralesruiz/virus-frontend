export enum CardKind {
  Organ = 'organ',
  Virus = 'virus',
  Medicine = 'medicine',
  Treatment = 'treatment',
}

export enum CardColor {
  Red = 'red', // Corazón
  Green = 'green', // Estómago
  Blue = 'blue', // Cerebro
  Yellow = 'yellow', // Hueso
  Multi = 'multi', // Multicolor (afecta a todos)
}

export enum TreatmentSubtype {
  Transplant = 'transplant', // Trasplante
  OrganThief = 'organThief', // Ladrón de Órganos
  Contagion = 'contagion', // Contagio
  Gloves = 'gloves', // Guantes de Látex
  MedicalError = 'medicalError', // Error Médico
}

export interface Card {
  id: string;
  kind: CardKind;
  color: CardColor;
  subtype?: TreatmentSubtype; // Solo para Treatment
}

export type DeckConfigItem = {
  kind: CardKind;
  color: CardColor;
  count: number;
  subtype?: TreatmentSubtype;
};

import { CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';

export const KIND_LABELS: Record<CardKind, string> = {
  [CardKind.Organ]: 'Órgano',
  [CardKind.Virus]: 'Virus',
  [CardKind.Medicine]: 'Medicina',
  [CardKind.Treatment]: 'Tratamiento',
};

export const COLOR_LABELS: Record<string, string> = {
  red: 'Corazón',
  green: 'Estómago',
  blue: 'Cerebro',
  yellow: 'Hueso',
  multi: 'Multicolor',
  orange: 'Mutante',
  treatment: 'Tratamiento',
  halloween: 'Halloween',
};

export const TREATMENT_LABELS: Partial<Record<TreatmentSubtype, string>> = {
  [TreatmentSubtype.Transplant]: 'Trasplante',
  [TreatmentSubtype.OrganThief]: 'Ladrón de órganos',
  [TreatmentSubtype.Contagion]: 'Contagio',
  [TreatmentSubtype.Gloves]: 'Guantes de látex',
  [TreatmentSubtype.MedicalError]: 'Error médico',
  [TreatmentSubtype.trickOrTreat]: 'Truco o trato',
  [TreatmentSubtype.failedExperiment]: 'Experimento fallido',
  [TreatmentSubtype.colorThiefRed]: 'Ladrón Corazón',
  [TreatmentSubtype.colorThiefGreen]: 'Ladrón Estómago',
  [TreatmentSubtype.colorThiefBlue]: 'Ladrón Cerebro',
  [TreatmentSubtype.colorThiefYellow]: 'Ladrón Hueso',
  [TreatmentSubtype.BodySwap]: 'Cambio de Cuerpos',
  [TreatmentSubtype.Apparition]: 'Aparición',
  [TreatmentSubtype.AlienTransplant]: 'Trasplante Alienígena',
};

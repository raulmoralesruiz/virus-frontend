
import { CardColor, TreatmentSubtype } from '../../../../../core/models/card.model';

export const ORGAN_ICONS: Record<CardColor, string> = {
  [CardColor.Red]: 'organ-red',
  [CardColor.Green]: 'organ-green',
  [CardColor.Blue]: 'organ-blue',
  [CardColor.Yellow]: 'organ-yellow',
  [CardColor.Multi]: 'organ-multi',
  [CardColor.Halloween]: 'organ-halloween',
  [CardColor.Orange]: 'organ-orange',
  [CardColor.Treatment]: '',
};

export const TREATMENT_ICONS: Record<TreatmentSubtype, string> = {
  [TreatmentSubtype.Transplant]: 'treatment-transplant',
  [TreatmentSubtype.OrganThief]: 'treatment-organThief',
  [TreatmentSubtype.Contagion]: 'treatment-contagion',
  [TreatmentSubtype.Gloves]: 'treatment-gloves',
  [TreatmentSubtype.MedicalError]: 'treatment-medicalError',
  [TreatmentSubtype.failedExperiment]: 'treatment-failedExperiment',
  [TreatmentSubtype.trickOrTreat]: 'treatment-trickOrTreat',
  [TreatmentSubtype.colorThiefRed]: 'treatment-colorThief',
  [TreatmentSubtype.colorThiefGreen]: 'treatment-colorThief',
  [TreatmentSubtype.colorThiefBlue]: 'treatment-colorThief',
  [TreatmentSubtype.colorThiefYellow]: 'treatment-colorThief',
  [TreatmentSubtype.BodySwap]: 'treatment-bodySwap',
  [TreatmentSubtype.Apparition]: 'treatment-apparition',
  [TreatmentSubtype.AlienTransplant]: 'treatment-alienTransplant',
};

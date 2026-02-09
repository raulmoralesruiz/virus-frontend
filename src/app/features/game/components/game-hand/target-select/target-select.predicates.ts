import { Card, CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';

export function isTransplantCard(c: Card): boolean {
  return c.kind === CardKind.Treatment && (c.subtype === TreatmentSubtype.Transplant || c.subtype === TreatmentSubtype.AlienTransplant);
}

export function isContagionCard(c: Card): boolean {
  return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.Contagion;
}

export function isFailedExperimentCard(c: Card): boolean {
  return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.failedExperiment;
}

export function isPlayerOnlyCard(c: Card): boolean {
  return c.kind === CardKind.Treatment && (c.subtype === TreatmentSubtype.MedicalError || c.subtype === TreatmentSubtype.trickOrTreat);
}

export function isBodySwapCard(c: Card): boolean {
  return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.BodySwap;
}

export function isSelfTargetCard(c: Card): boolean {
  return c.kind === CardKind.Organ && c.color === CardColor.Orange;
}

export function getRequiresTargetSelection(c: Card): boolean {
  if (c.kind === CardKind.Treatment) {
    return [
      TreatmentSubtype.Transplant, TreatmentSubtype.AlienTransplant, TreatmentSubtype.OrganThief,
      TreatmentSubtype.MedicalError, TreatmentSubtype.Contagion, TreatmentSubtype.trickOrTreat,
      TreatmentSubtype.failedExperiment, TreatmentSubtype.BodySwap,
      TreatmentSubtype.colorThiefRed, TreatmentSubtype.colorThiefGreen,
      TreatmentSubtype.colorThiefBlue, TreatmentSubtype.colorThiefYellow
    ].includes(c.subtype as TreatmentSubtype);
  }
  return (c.kind === CardKind.Organ && c.color === 'orange') || c.kind === CardKind.Virus || c.kind === CardKind.Medicine;
}

import { OrganOnBoard } from '../models/game.model';
import { CardKind } from '../models/card.model';

export const isInfected = (organ: OrganOnBoard): boolean =>
  organ.attached.some(c => c.kind === CardKind.Virus);

export const isVaccinated = (organ: OrganOnBoard): boolean =>
  organ.attached.some(c => c.kind === CardKind.Medicine);

export const isImmune = (organ: OrganOnBoard): boolean => {
  const meds = organ.attached.filter(c => c.kind === CardKind.Medicine);
  return meds.length === 2;
};

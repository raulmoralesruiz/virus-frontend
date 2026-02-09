import { Card, CardKind, CardColor, TreatmentSubtype } from '@core/models/card.model';
import { OrganOnBoard } from '@core/models/game.model';
import { isInfected, isVaccinated, isImmune } from '@core/utils/organ.utils';

export function isValidDropTarget(dragged: any, organ: OrganOnBoard, isMe: boolean): boolean {
  if (!dragged) return false;

  // 1. Carta desde la mano
  if ('kind' in dragged && dragged.kind !== 'virus-token') {
    const card = dragged as Card;

    if (card.kind === CardKind.Medicine || card.kind === CardKind.Virus) {
      if (card.color === CardColor.Multi || organ.color === CardColor.Multi) return true;
      return card.color === organ.color;
    }

    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
      // Órgano Mutante: debe animar todos los órganos del propio jugador
      return isMe;
    }

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.OrganThief:
          // !isMe() && !isImmune
          return !isMe && !isImmune(organ);

        case TreatmentSubtype.Transplant:
          // "debe animar todos los órganos de todos los tableros (sin tener en cuenta lor órganos inmunes)"
          return !isImmune(organ);

        case TreatmentSubtype.AlienTransplant:
          // "debe animar todos los órganos de todos los tableros"
          return true;

        case TreatmentSubtype.failedExperiment:
          // "debe animar los órganos infectados o vacunados (no inmunes)"
          return (isInfected(organ) || isVaccinated(organ)) && !isImmune(organ);

        case TreatmentSubtype.colorThiefRed:
        case TreatmentSubtype.colorThiefGreen:
        case TreatmentSubtype.colorThiefBlue:
        case TreatmentSubtype.colorThiefYellow:
          // "solo debe animar los órganos correspondientes"
          if (isMe) return false;
          
          // Map subtype to color
          let targetColor: CardColor | null = null;
          if (card.subtype === TreatmentSubtype.colorThiefRed) targetColor = CardColor.Red;
          if (card.subtype === TreatmentSubtype.colorThiefGreen) targetColor = CardColor.Green;
          if (card.subtype === TreatmentSubtype.colorThiefBlue) targetColor = CardColor.Blue;
          if (card.subtype === TreatmentSubtype.colorThiefYellow) targetColor = CardColor.Yellow;

          if (!targetColor) return false;
          
          return organ.color === targetColor;

        default:
          return false;
      }
    }
    
    return false; 
  }

  // 2. Virus desde otro órgano (Contagio)
  if ('virus' in dragged) {
    const virus = dragged.virus as Card;
    if (virus.color === CardColor.Multi || organ.color === CardColor.Multi) return true;
    return virus.color === organ.color;
  }

  return false;
}

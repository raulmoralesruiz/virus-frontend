import { Card, CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';
import { KIND_LABELS, COLOR_LABELS, TREATMENT_LABELS } from './target-select.constants';

export function getCardKindLabel(card: Card): string {
    return KIND_LABELS[card.kind];
}

export function getCardColorLabel(card: Card): string {
    return COLOR_LABELS[card.color] ?? card.color;
}

export function getCardSubtypeLabel(card: Card): string | null {
    return (card.kind === CardKind.Treatment && card.subtype) ? (TREATMENT_LABELS[card.subtype] ?? card.subtype) : null;
}

export function getCardEffectDescription(card: Card): string {
  switch (card.kind) {
    case CardKind.Organ:
      return 'Añade este órgano sano a tu cuerpo para acercarte a la victoria.';
    case CardKind.Virus:
      return 'Infecta un órgano compatible y podría eliminarlo si ya estaba enfermo.';
    case CardKind.Medicine:
      return 'Cura un órgano infectado o lo vacuna para protegerlo de futuros virus.';
    case CardKind.Treatment:
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
          return 'Intercambia dos órganos entre jugadores respetando los colores disponibles.';
        case TreatmentSubtype.OrganThief:
          return 'Roba un órgano compatible de otro jugador y colócalo en tu tablero.';
        case TreatmentSubtype.Contagion:
          return 'Traslada tus virus a órganos libres de otros jugadores para infectarlos.';
        case TreatmentSubtype.Gloves:
          return 'Obliga a todos los rivales a descartar su mano, robar nuevas cartas y perder el próximo turno.';
        case TreatmentSubtype.MedicalError:
          return 'Intercambia por completo tu cuerpo con el jugador elegido.';
        case TreatmentSubtype.trickOrTreat:
          return 'Maldecirás a un jugador impidiendo su victoria hasta que cure a otro rival.';
        case TreatmentSubtype.failedExperiment:
          return 'Actúa como un virus o una medicina de cualquier color sobre un órgano infectado o vacunado.';
        case TreatmentSubtype.BodySwap:
          return 'Todos los jugadores pasan su cuerpo al jugador de al lado en el sentido elegido.';
        case TreatmentSubtype.Apparition:
          return 'Roba la carta del mazo de descartes, después puedes jugar esa carta o quedártela en la mano.';
        case TreatmentSubtype.AlienTransplant:
          return 'Intercambia dos órganos entre jugadores respetando los colores disponibles, incluso órganos inmunes.';
        default:
          return 'Aplica un efecto especial sobre la partida.';
      }
    default:
      return 'Aplica un efecto especial sobre la partida.';
  }
}

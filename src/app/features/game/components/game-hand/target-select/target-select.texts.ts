import { CardKind, TreatmentSubtype, CardColor, Card } from '../../../../../core/models/card.model';

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

export function getInstruction(
    card: Card, 
    isTransplant: boolean, 
    isContagion: boolean, 
    requiresTargetSelection: boolean,
    description: string
): string {
    if (isTransplant) {
      if (card.subtype === TreatmentSubtype.AlienTransplant) {
        return 'Elige dos órganos distintos para intercambiarlos entre jugadores sin repetir colores, incluso órganos inmunes.';
      }
      return 'Elige dos órganos distintos para intercambiarlos entre jugadores sin repetir colores.';
    }
    if (isContagion) {
      return 'Asigna cada virus a un órgano libre de otro jugador para propagar la infección.';
    }
    if (requiresTargetSelection) {
      if (card.kind === CardKind.Medicine) {
        return 'Selecciona el órgano que quieres curar o vacunar; eliminará un virus compatible o añadirá protección.';
      }
      if (card.kind === CardKind.Virus) {
        return 'Selecciona el órgano que quieres infectar para dañarlo o extirparlo si ya está enfermo.';
      }
      if (card.subtype === TreatmentSubtype.OrganThief) {
        return 'Elige el órgano que vas a robar para añadirlo a tu cuerpo.';
      }
      if (
        card.subtype === TreatmentSubtype.colorThiefRed ||
        card.subtype === TreatmentSubtype.colorThiefGreen ||
        card.subtype === TreatmentSubtype.colorThiefBlue ||
        card.subtype === TreatmentSubtype.colorThiefYellow
      ) {
        return 'Elige el órgano de ese color que vas a robar.';
      }
      if (card.subtype === TreatmentSubtype.MedicalError) {
        return 'Selecciona al jugador con el que intercambiarás todos tus órganos.';
      }
      if (card.subtype === TreatmentSubtype.trickOrTreat) {
        return 'Elige al jugador cuyo cuerpo quedará maldito con Truco o Trato.';
      }
      if (card.subtype === TreatmentSubtype.failedExperiment) {
        return 'Elige un órgano infectado o vacunado y decide si usarla como Medicina o Virus.';
      }
      if (card.subtype === TreatmentSubtype.BodySwap) {
        return 'Elige el sentido en el que rotarán todos los cuerpos.';
      }
      if (card.color === 'orange') {
        return 'Elige cuál de tus órganos será reemplazado por el Órgano Mutante.';
      }
      return `Selecciona el objetivo para esta carta. ${description}`;
    }
    return `${description} Confirma para jugarla.`;
}

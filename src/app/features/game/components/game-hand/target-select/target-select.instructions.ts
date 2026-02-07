import { Card, CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';

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

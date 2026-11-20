import { Injectable, inject } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { Card, CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '@core/models/game.model';
import { isImmune, isInfected, isVaccinated } from '@core/utils/organ.utils';

@Injectable({ providedIn: 'root' })
export class BoardDragPredicates {
  private _apiPlayer: ApiPlayerService = inject(ApiPlayerService);

  isCardValidForBoard(card: Card, isMe: boolean, playerInfoId?: string): boolean {
    switch (card.kind) {
      case CardKind.Organ:
        if (card.color === CardColor.Orange) return false;
        return isMe;

      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
            return true;

          case TreatmentSubtype.MedicalError:
          case TreatmentSubtype.trickOrTreat: {
            if (!this._apiPlayer.player()) return false;
            // If checking "isMe", then playerInfoId is my ID.
            // But this check is for "Rivales". So if isMe is true, it's my board, returning false is correct.
            // If isMe is false, it's a rival board, returning true is correct.
            return !isMe;
          }

          case TreatmentSubtype.Contagion:
            return isMe;

          default:
            return false;
        }

      default:
        return false;
    }
  }

  /**
   * ¿La carta se juega sobre el tablero entero (y no sobre órganos concretos)?
   * Ej.: Guantes, Intercambio, Aparición, Error Médico, Truco o Trato, Contagio,
   * y los órganos normales (se colocan en el tablero propio).
   */
  isBoardTargetCard(card: Card): boolean {
    switch (card.kind) {
      case CardKind.Organ:
        // El Órgano Mutante (naranja) se coloca sobre un órgano propio, no sobre el tablero
        return card.color !== CardColor.Orange;
      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
          case TreatmentSubtype.MedicalError:
          case TreatmentSubtype.trickOrTreat:
          case TreatmentSubtype.Contagion:
            return true;
          default:
            return false;
        }
      default:
        // Medicina y Virus siempre se juegan sobre un órgano
        return false;
    }
  }

  /**
   * ¿La carta se juega sobre órganos concretos?
   * Ej.: Medicina, Virus, Órgano Mutante, Ladrón de Órganos, Trasplante,
   * Trasplante alienígena, Ladrón de colores, Experimento fallido.
   */
  isOrganTargetCard(card: Card): boolean {
    switch (card.kind) {
      case CardKind.Medicine:
      case CardKind.Virus:
        return true;
      case CardKind.Organ:
        return card.color === CardColor.Orange;
      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.OrganThief:
          case TreatmentSubtype.Transplant:
          case TreatmentSubtype.AlienTransplant:
          case TreatmentSubtype.failedExperiment:
          case TreatmentSubtype.colorThiefRed:
          case TreatmentSubtype.colorThiefGreen:
          case TreatmentSubtype.colorThiefBlue:
          case TreatmentSubtype.colorThiefYellow:
            return true;
          default:
            return false;
        }
      default:
        return false;
    }
  }

  checkBoardEnter(drag: CdkDrag, _drop: CdkDropList<any>, playerInfo: PublicPlayerInfo, isMe: boolean): boolean {
    const data = drag.data as Card | { virusId: string } | undefined;
    if (!data) return false;

    if ('virusId' in (data as any)) {
      return false;
    }

    const card = data as Card;
    return this.isCardValidForBoard(card, isMe, playerInfo.player.id);
  }

  checkSlotEnter(drag: CdkDrag, drop: CdkDropList<any>, playerInfo: PublicPlayerInfo, isMe: boolean): boolean {
    const data = drag.data as Card | { virusId: string; virus?: Card } | undefined;
    if (!data) return false;

    const organ = drop.data[0] as OrganOnBoard;
    if (!organ) return false;

    // 1. Virus dragging (Contagion)
    if ('virusId' in (data as any)) {
      const virusData = data as { virusId: string; virus?: Card };
      const virus = virusData.virus;
      if (!virus) return true;

      if (virus.color === CardColor.Multi || organ.color === CardColor.Multi)
        return true;
      return virus.color === organ.color;
    }

    const card = data as Card;

    // 2. Organ (Mutant)
    if (card.kind === CardKind.Organ) {
      if (card.color === CardColor.Orange) {
        return isMe;
      }
      return false;
    }

    // 3. Medicine / Virus
    if (card.kind === CardKind.Medicine || card.kind === CardKind.Virus) {
      if (card.color === CardColor.Multi || organ.color === CardColor.Multi)
        return true;
      return card.color === organ.color;
    }

    // 4. Treatments
    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.OrganThief:
          return !isMe && !isImmune(organ);

        case TreatmentSubtype.Transplant:
          return !isImmune(organ);

        case TreatmentSubtype.AlienTransplant:
          return true;

        case TreatmentSubtype.failedExperiment:
          return (isInfected(organ) || isVaccinated(organ)) && !isImmune(organ);

        case TreatmentSubtype.colorThiefRed:
        case TreatmentSubtype.colorThiefGreen:
        case TreatmentSubtype.colorThiefBlue:
        case TreatmentSubtype.colorThiefYellow: {
          if (isMe) return false;
          let targetColor: CardColor | null = null;
          if (card.subtype === TreatmentSubtype.colorThiefRed) targetColor = CardColor.Red;
          if (card.subtype === TreatmentSubtype.colorThiefGreen) targetColor = CardColor.Green;
          if (card.subtype === TreatmentSubtype.colorThiefBlue) targetColor = CardColor.Blue;
          if (card.subtype === TreatmentSubtype.colorThiefYellow) targetColor = CardColor.Yellow;

          // Target color is always set due to the switch cases above, but TS needs to be sure or we need a default.
          return targetColor ? organ.color === targetColor : false;
        }

        default:
          return false;
      }
    }

    return false;
  }
}

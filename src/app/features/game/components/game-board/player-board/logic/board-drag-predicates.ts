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

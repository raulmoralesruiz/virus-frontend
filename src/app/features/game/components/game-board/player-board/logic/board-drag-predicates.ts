import { Injectable, inject } from '@angular/core';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ApiPlayerService } from '../../../../../../core/services/api/api.player.service';
import { Card, CardKind, TreatmentSubtype, CardColor } from '../../../../../../core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '../../../../../../core/models/game.model';
import { isImmune, isInfected, isVaccinated } from '../../../../../../core/utils/organ.utils';

@Injectable({ providedIn: 'root' })
export class BoardDragPredicates {
  private _apiPlayer: ApiPlayerService = inject(ApiPlayerService);

  checkBoardEnter(drag: CdkDrag, _drop: CdkDropList<any>, playerInfo: PublicPlayerInfo, isMe: boolean): boolean {
    const data = drag.data as Card | { virusId: string } | undefined;
    if (!data) return false;

    if ('virusId' in (data as any)) {
      return false;
    }

    const card = data as Card;

    switch (card.kind) {
      case CardKind.Organ:
        if (card.color === CardColor.Orange) return false;
        return isMe;

      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
            return true;

          case TreatmentSubtype.MedicalError:
          case TreatmentSubtype.trickOrTreat: {
            const me = this._apiPlayer.player();
            return !!me && playerInfo.player.id !== me.id;
          }

          case TreatmentSubtype.Contagion:
            return isMe;

          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
            return true;

          default:
            return false;
        }

      default:
        return false;
    }
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

          if (!targetColor) return false;
          return organ.color === targetColor;
        }

        default:
          return false;
      }
    }

    return false;
  }
}

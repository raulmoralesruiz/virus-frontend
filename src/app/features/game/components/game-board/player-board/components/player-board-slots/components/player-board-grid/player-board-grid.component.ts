import { Component, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { PlayerCardComponent } from '../../../../player-card/player-card';
import { Card, CardColor, CardKind, TreatmentSubtype } from '../../../../../../../../../core/models/card.model';
import { OrganOnBoard, PublicGameState, PublicPlayerInfo } from '../../../../../../../../../core/models/game.model';
import { GameStoreService } from '../../../../../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../../../../../core/services/api/api.player.service';
import { PlayerBoardDropService } from '../../../../services/player-board-drop.service';
import { BoardContagionService } from '../../../../services/board-contagion.service';
import { BoardActionService } from '../../../../services/board-action.service';
import { BoardDragPredicates } from '../../../../logic/board-drag-predicates';
import { ContagionState, FailedExperimentEvent, TransplantSelectionEvent, TransplantState, VirusDropEvent } from '../../../../player-board.models';

@Component({
  selector: 'player-board-grid',
  standalone: true,
  imports: [PlayerCardComponent, DragDropModule],
  templateUrl: './player-board-grid.component.html',
  styleUrl: './player-board-grid.component.css',
  hostDirectives: [CdkDropListGroup],
})
export class PlayerBoardGridComponent {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);
  private dropService = inject(PlayerBoardDropService);
  private contagionService = inject(BoardContagionService);
  private actionService = inject(BoardActionService);
  private predicates = inject(BoardDragPredicates);

  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  allSlotIds = input.required<string[]>();
  roomId = input.required<string>();
  gameState = input.required<PublicGameState>();
  
  contagionState = input<ContagionState | null>(null);
  transplantState = input<TransplantState | null>(null);
  
  getTemporaryVirusesForOrgan = input.required<(organId: string, playerId: string) => Card[]>();
  hasTemporaryVirus = input.required<(organId: string, playerId: string) => boolean>();

  // Outputs corresponding to actions handled in slots
  virusMoved = output<VirusDropEvent>();
  startContagion = output<{ card: Card }>();
  startTransplant = output<TransplantSelectionEvent>();
  finishTransplant = output<{ organId: string; playerId: string }>();
  startFailedExperiment = output<FailedExperimentEvent>();

  slotEnterPredicate = (drag: CdkDrag, drop: CdkDropList<any>) =>
    this.predicates.checkSlotEnter(drag, drop, this.player(), this.isMe());

  onDrop(event: CdkDragDrop<any>, color: CardColor, organ?: OrganOnBoard | null) {
    if (this.contagionState()) {
      if (!organ) {
        this._gameStore.setClientError('Debes contagiar un órgano válido.');
        return;
      }
      this.onVirusDrop(event, organ);
    } else {
      this.onSlotDrop(event, color);
    }
  }

  onSlotDrop(event: CdkDragDrop<any>, color: CardColor) {
    const card: Card = event.item.data;
    const rid = this.roomId();
    const meId = this._apiPlayer.player()?.id;

    if (!rid || !meId) return;

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
        case TreatmentSubtype.AlienTransplant:
          this.startTransplantSelection(card, color);
          return;
        case TreatmentSubtype.failedExperiment:
          this.playFailedExperiment(card, color);
          return;
        case TreatmentSubtype.Contagion:
          this.playContagion(card);
          return;
      }
    }

    this.dropService.handleSlotDrop(event, rid, this.player(), this.isMe(), color);
  }

  onVirusDrop(event: CdkDragDrop<any>, organ: OrganOnBoard) {
    const contagionState = this.contagionState();
    if (!contagionState) return;

    const result = this.contagionService.validateVirusDrop(
      event,
      organ,
      contagionState,
      this.isMe(),
      this.player().player.id,
      this.hasTemporaryVirus(),
      this.gameState()
    );

    if (result) {
      this.virusMoved.emit(result);
    }
  }

  playContagion(card: Card) {
    if (this.actionService.validateContagion(card, this.isMe())) {
      this.startContagion.emit({ card });
    }
  }

  private playFailedExperiment(card: Card, color: CardColor) {
    const result = this.actionService.validateFailedExperiment(card, color, this.player());
    if (result) {
      this.startFailedExperiment.emit(result);
    }
  }

  private startTransplantSelection(card: Card, color: CardColor) {
    const result = this.actionService.validateTransplantSelection(card, color, this.player());
    if (result) {
      this.startTransplant.emit(result);
    }
  }

  onSlotClick(organ: any, playerId: string) {
    const result = this.actionService.validateSlotClick(organ, playerId, this.transplantState());
    if (result) {
      this.finishTransplant.emit(result);
    }
  }

  getConnectedIdsForSlot(color: CardColor): string[] {
    const me = this._apiPlayer.player();
    const result: string[] = [];

    if (me) {
      result.push(`handList-${me.id}`);
    }

    const mySlotId = `slot-${this.player().player.id}-${color}`;
    const others = this.allSlotIds().filter((id) => id !== mySlotId);
    result.push(...others);

    return result;
  }
}

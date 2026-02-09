import { Component, inject, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { PlayerCardComponent } from '../../../../player-card/player-card';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { OrganOnBoard, PublicGameState, PublicPlayerInfo } from '@core/models/game.model';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
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
  virusMoved = output<VirusDropEvent>();
  startContagion = output<{ card: Card }>();
  startTransplant = output<TransplantSelectionEvent>();
  finishTransplant = output<{ organId: string; playerId: string }>();
  startFailedExperiment = output<FailedExperimentEvent>();

  slotEnterPredicate = (drag: CdkDrag, drop: CdkDropList<any>) =>
    this.predicates.checkSlotEnter(drag, drop, this.player(), this.isMe());

  onDrop(event: CdkDragDrop<any>, color: CardColor, organ?: OrganOnBoard | null) {
    if (this.contagionState()) {
      if (!organ) return this._gameStore.setClientError('Debes contagiar un órgano válido.');
      this.onVirusDrop(event, organ);
    } else {
      this.onSlotDrop(event, color);
    }
  }

  onSlotDrop(event: CdkDragDrop<any>, color: CardColor) {
    const card: Card = event.item.data;
    if (!this.roomId() || !this._apiPlayer.player()?.id) return;

    if (card.kind === CardKind.Treatment) {
      if (card.subtype === TreatmentSubtype.Transplant || card.subtype === TreatmentSubtype.AlienTransplant) {
        const result = this.actionService.validateTransplantSelection(card, color, this.player());
        if (result) this.startTransplant.emit(result);
        return;
      }
      if (card.subtype === TreatmentSubtype.failedExperiment) {
        const result = this.actionService.validateFailedExperiment(card, color, this.player());
        if (result) this.startFailedExperiment.emit(result);
        return;
      }
      if (card.subtype === TreatmentSubtype.Contagion) {
        if (this.actionService.validateContagion(card, this.isMe())) this.startContagion.emit({ card });
        return;
      }
    }
    this.dropService.handleSlotDrop(event, this.roomId(), this.player(), this.isMe(), color);
  }

  onVirusDrop(event: CdkDragDrop<any>, organ: OrganOnBoard) {
    const state = this.contagionState();
    if (!state) return;
    const res = this.contagionService.validateVirusDrop(
      event, organ, state, this.isMe(), this.player().player.id, this.hasTemporaryVirus(), this.gameState()
    );
    if (res) this.virusMoved.emit(res);
  }

  onSlotClick(organ: any, playerId: string) {
    const res = this.actionService.validateSlotClick(organ, playerId, this.transplantState());
    if (res) this.finishTransplant.emit(res);
  }

  getConnectedIdsForSlot(color: CardColor): string[] {
    const me = this._apiPlayer.player();
    const others = this.allSlotIds().filter((id) => id !== `slot-${this.player().player.id}-${color}`);
    return me ? [`handList-${me.id}`, ...others] : others;
  }
}

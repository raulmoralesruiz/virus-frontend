import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Card, CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';
import { PublicGameState, PublicPlayerInfo } from '../../../../../core/models/game.model';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';
import { DragDropService } from '../../../../../core/services/drag-drop.service';
import { PlayerBoardHeaderComponent } from './components/player-board-header/player-board-header.component';
import { PlayerBoardSlotsComponent } from './components/player-board-slots/player-board-slots.component';
import { PlayerBoardDropService } from './services/player-board-drop.service';
import { BoardDragPredicates } from './logic/board-drag-predicates';
import { BoardContagionService } from './services/board-contagion.service';
import { BoardActionService } from './services/board-action.service';
import { ContagionState, FailedExperimentEvent, TransplantSelectionEvent, TransplantState, VirusDropEvent } from './player-board.models';

@Component({
  selector: 'player-board',
  standalone: true,
  imports: [DragDropModule, PlayerBoardHeaderComponent, PlayerBoardSlotsComponent],
  providers: [PlayerBoardDropService, BoardContagionService, BoardActionService],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
  host: {
    '[class.is-me]': 'isMe()',
    '[class.is-active]': 'isActive()',
    'class': 'player-board'
  }
})
export class PlayerBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private dragDropService = inject(DragDropService);
  private dropService = inject(PlayerBoardDropService);
  private predicates = inject(BoardDragPredicates);
  private actionService = inject(BoardActionService);

  get apiPlayer() { return this._apiPlayer; }
  get gameStore() { return this._gameStore; }

  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  isActive = input(false);
  roomId = input.required<string>();
  gameState = input.required<PublicGameState>();
  remainingSeconds = input(0);
  getTemporaryVirusesForOrgan = input.required<(organId: string, playerId: string) => Card[]>();
  hasTemporaryVirus = input.required<(organId: string, playerId: string) => boolean>();
  allSlotIds = input.required<string[]>();
  contagionState = input<ContagionState | null>(null);
  virusMoved = output<VirusDropEvent>();
  startContagion = output<{ card: Card }>();
  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();
  transplantState = input<TransplantState | null>(null);
  startTransplant = output<TransplantSelectionEvent>();
  finishTransplant = output<{ organId: string; playerId: string }>();
  startFailedExperiment = output<FailedExperimentEvent>();
  isDragOver = signal(false);
  boardDropListId = computed(() => `board-${this.player().player.id}`);

  isValidBoardTarget = computed(() => {
    const dragged = this.dragDropService.draggedItem();
    if (!dragged || 'virusId' in dragged) return false;
    return this.predicates.isCardValidForBoard(dragged as Card, this.isMe(), this.player().player.id);
  });

  connectedTo = computed(() => {
    const me = this._apiPlayer.player();
    return me ? [`handList-${me.id}`] : [];
  });

  constructor() {
    effect(() => {
      if (!this.dragDropService.draggedItem()) this.isDragOver.set(false);
    });
  }

  boardEnterPredicate = (drag: CdkDrag, drop: CdkDropList<any>) =>
    this.predicates.checkBoardEnter(drag, drop, this.player(), this.isMe());
  
  onBoardEnter = (_event: any) => this.isDragOver.set(true);
  onBoardExit = (_event: any) => this.isDragOver.set(false);

  onBoardDrop(event: CdkDragDrop<any>) {
    this.isDragOver.set(false);
    const card = event.item.data as Card;
    
    if (card.kind === CardKind.Treatment) {
      if (card.subtype === TreatmentSubtype.BodySwap) return this.startBodySwap.emit({ card });
      if (card.subtype === TreatmentSubtype.Apparition) return this.startApparition.emit({ card });
      if (card.subtype === TreatmentSubtype.Contagion) {
        if (this.actionService.validateContagion(card, this.isMe())) this.startContagion.emit({ card });
        return;
      }
    }

    this.dropService.handleBoardDrop(event, this.roomId(), this.player(), this.isMe());
  }
}

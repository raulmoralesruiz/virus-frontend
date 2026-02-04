import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  NgZone,
  OnChanges,
  SimpleChanges,
  input,
  computed,
  signal,
} from '@angular/core';
import { Card, CardKind, CardColor } from '../../../../core/models/card.model';
import { HandCard } from './hand-card/hand-card';
import {
  PublicGameState,
  PlayCardTarget,
} from '../../../../core/models/game.model';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TargetSelectComponent } from './target-select/target-select.component';
import { HandActionService } from './services/hand-action.service';
import { ApparitionBannerComponent } from './components/apparition-banner/apparition-banner.component';
import { HandListComponent } from './components/hand-list/hand-list.component';
import { DiscardActionButtonComponent } from './components/discard-action-button/discard-action-button.component';

@Component({
  selector: 'game-hand',
  standalone: true,
  imports: [DragDropModule, TargetSelectComponent, ApparitionBannerComponent, HandListComponent, DiscardActionButtonComponent],
  templateUrl: './game-hand.html',
  styleUrl: './game-hand.css',
  providers: [HandActionService],
})
export class GameHandComponent implements OnChanges, OnDestroy {
  private _apiPlayer = inject(ApiPlayerService);
  private _ngZone = inject(NgZone);
  private _handAction = inject(HandActionService);
  private _gameStore = inject(GameStoreService);
  private _handPanel?: ElementRef<HTMLDivElement>;
  private _resizeObserver?: ResizeObserver;

  // Expose for template
  get handAction() { return this._handAction; }
  get apiPlayer() { return this._apiPlayer; }

  hand = input<Card[]>([]);
  isMyTurn = input(false);
  roomId = input<string | null>(null);
  publicState = input<PublicGameState | null>(null);
  gameEnded = input(false);

  // View State using Service Signals
  selectedCard = this._handAction.selectedCard;
  targetOptions = this._handAction.targetOptions;
  selectedTarget = this._handAction.selectedTarget;
  selectedTargetA = this._handAction.selectedTargetA;
  selectedTargetB = this._handAction.selectedTargetB;
  selectedDirection = this._handAction.selectedDirection;
  selectedActionForFailedExperiment = this._handAction.selectedActionForFailedExperiment;
  contagionAssignments = this._handAction.contagionAssignments;
  isDragDropSelection = this._handAction.isDragDropSelection;
  canConfirmSelection = this._handAction.canConfirmSelection;

  // Discard logic separate from playing strategies for simplicity
  readonly selectedDiscardIds = signal<Set<string>>(new Set());
  readonly selectedDiscardCount = computed(() => this.selectedDiscardIds().size);

  readonly mustPlayCardId = computed(() => {
    const st = this.publicState();
    const me = this.apiPlayer.player();
    if (!st || !me || !st.pendingAction) return null;
    if (
      st.pendingAction.type === 'ApparitionDecision' &&
      st.pendingAction.playerId === me.id
    ) {
      return st.pendingAction.cardId;
    }
    return null;
  });

  panelSpacerHeight = 0;

  @ViewChild('handPanel')
  set handPanelRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref) {
      this._handPanel = ref;
      this.setupPanelObserver();
    } else {
      this._handPanel = undefined;
      this.teardownPanelObserver();
      this.panelSpacerHeight = 0;
    }
  }

  boardIds(): string[] {
    const publicState = this.publicState();
    if (!publicState) return [];
    const ids: string[] = [];
    for (const p of publicState.players) {
      ids.push(`board-${p.player.id}`);
      for (const organ of p.board) {
        ids.push(`slot-${p.player.id}-${organ.color}`);
      }
    }
    return ids;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const turnChange = changes['isMyTurn'];
    if (!turnChange || turnChange.firstChange) return;

    if (!turnChange.previousValue && turnChange.currentValue) {
      this._handAction.clearSelection();
    }

    if (turnChange.previousValue && !turnChange.currentValue) {
      this._handAction.clearSelection();
      this.resetDiscardSelection();
    }
  }

  ngOnDestroy(): void {
    this.teardownPanelObserver();
  }

  toggleDiscardSelection(card: Card) {
    if (!this.isMyTurn()) return;
    this.selectedDiscardIds.update((current) => {
      const next = new Set(current);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }
  
  discardSelectedCardsReal() {
      const roomId = this.roomId();
      const selectedIds = Array.from(this.selectedDiscardIds());
      if (!roomId || !selectedIds.length) return;
      this._gameStore.discardCards(roomId, selectedIds);
      this.resetDiscardSelection();
  }

  isCardSelected(card: Card): boolean {
    return this.selectedDiscardIds().has(card.id);
  }

  selectCardToPlay(card: Card) {
      this._handAction.selectCard(card, this.publicState());
  }

  selectCardAndTarget(card: Card, target: PlayCardTarget) {
    this._handAction.selectCard(card, this.publicState());
    this._handAction.setTarget(target);
    // We might need to handle DragDropSelection flag in service if it's not set automatically 
    // or if we need to explicitly set it.
    // The service has `isDragDropSelection` signal.
    this._handAction.isDragDropSelection.set(true);
  }

  // Delegated UI handlers
  onTargetChange(value: string, which: 'A' | 'B' | 'single' = 'single') {
    if (!value) {
      if (which === 'A') this._handAction.setTargetA(null);
      else if (which === 'B') this._handAction.setTargetB(null);
      else this._handAction.setTarget(null);
      return;
    }
    const [organId, playerId] = value.split('|');
    const target = { organId, playerId };

    if (which === 'A') this._handAction.setTargetA(target);
    else if (which === 'B') this._handAction.setTargetB(target);
    else this._handAction.setTarget(target);
  }

  onContagionTargetChange(value: string, idx: number) {
     if (!value) {
         this._handAction.updateContagionAssignment(idx, '', '');
         return;
     }
     const [organId, playerId] = value.split('|');
     this._handAction.updateContagionAssignment(idx, organId, playerId);
  }

  onDirectionChange(direction: 'clockwise' | 'counter-clockwise' | null) {
    this._handAction.setDirection(direction);
  }

  confirmPlayCard() {
      const roomId = this.roomId();
      if (roomId) this._handAction.confirmPlay(roomId);
  }

  keepApparitionCard() {
    if (!this.mustPlayCardId()) return;
    const st = this.publicState();
    if (!st) return;
    this._gameStore.endTurn(st.roomId);
  }

  private setupPanelObserver() {
    if (!this._handPanel) return;
    this.teardownPanelObserver();
    const element = this._handPanel.nativeElement;
    
    // Simplification of observer logic if possible, but keeping it robust for now
    const updateHeight = (height: number) => {
      this._ngZone.run(() => {
        setTimeout(() => {
          this.panelSpacerHeight = Math.max(0, Math.round(height));
        });
      });
    };

    if (typeof ResizeObserver === 'undefined') {
      updateHeight(element.getBoundingClientRect().height);
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          updateHeight(entry.contentRect.height);
        }
      });
      this._resizeObserver.observe(element);
    });
  }

  private teardownPanelObserver() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  private resetDiscardSelection() {
    this.selectedDiscardIds.set(new Set());
  }
}

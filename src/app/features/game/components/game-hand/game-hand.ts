import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../core/models/card.model';
import { HandCard } from './hand-card/hand-card';
import {
  PublicGameState,
  PlayCardTarget,
  AnyPlayTarget,
} from '../../../../core/models/game.model';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  TargetSelectComponent,
  type TargetSelectOption,
} from './target-select/target-select.component';

@Component({
  selector: 'game-hand',
  standalone: true,
  imports: [HandCard, DragDropModule, TargetSelectComponent],
  templateUrl: './game-hand.html',
  styleUrl: './game-hand.css',
})
export class GameHandComponent implements OnChanges, OnDestroy {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private _ngZone = inject(NgZone);
  private _handPanel?: ElementRef<HTMLDivElement>;
  private _resizeObserver?: ResizeObserver;
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  @Input() hand: Card[] = [];
  @Input() isMyTurn: boolean = false;
  @Input() roomId!: string;
  @Input() publicState!: PublicGameState | null;
  @Input() gameEnded: boolean = false;

  // Estado interno
  selectedCard: Card | null = null;
  selectedCardsToDiscard: Card[] = [];
  targetOptions: TargetSelectOption[] = [];
  selectedTarget: PlayCardTarget | null = null;
  selectedTargetA: PlayCardTarget | null = null;
  selectedTargetB: PlayCardTarget | null = null;
  panelSpacerHeight = 0;

  contagionAssignments: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[] = [];

  // referencias públicas
  CardKind = CardKind;
  TreatmentSubtype = TreatmentSubtype;
  cardColors = Object.values(CardColor);

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

  // Construye la lista de ids de TODOS los slots (player x color).
  // El hand list se conectará a todos esos slots.
  boardIds(): string[] {
    if (!this.publicState) return [];
    const ids: string[] = [];
    for (const p of this.publicState.players) {
      for (const color of this.cardColors) {
        ids.push(`slot-${p.player.id}-${color}`);
      }
    }
    return ids;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const turnChange = changes['isMyTurn'];
    if (!turnChange || turnChange.firstChange) return;

    if (turnChange.previousValue && !turnChange.currentValue) {
      this.clearSelection();
      this.selectedCardsToDiscard = [];
    }
  }

  ngOnDestroy(): void {
    this.teardownPanelObserver();
  }

  onExitHand(event: any) {
    console.log(
      `[EXIT] Carta ${JSON.stringify(event.item.data.id)} salió de mano`
    );
  }

  toggleDiscardSelection(card: Card) {
    const idx = this.selectedCardsToDiscard.findIndex((c) => c.id === card.id);
    if (idx >= 0) this.selectedCardsToDiscard.splice(idx, 1);
    else this.selectedCardsToDiscard.push(card);
  }

  discardSelectedCards() {
    if (!this.roomId || this.selectedCardsToDiscard.length === 0) return;
    this._gameStore.discardCards(
      this.roomId,
      this.selectedCardsToDiscard.map((c) => c.id)
    );
    this.selectedCardsToDiscard = [];
  }

  selectCardToPlay(card: Card) {
    if (!this.isMyTurn && this.selectedCard?.id === card.id) {
      this.clearSelection();
      return;
    }

    this.selectedCard = card;
    this.targetOptions = [];
    this.selectedTarget = null;
    this.selectedTargetA = null;
    this.selectedTargetB = null;

    const st = this.publicState;
    if (!st) return;

    if (card.kind === CardKind.Virus || card.kind === CardKind.Medicine) {
      for (const p of st.players) {
        for (const o of p.board) {
          this.targetOptions.push({
            playerName: p.player.name,
            playerId: p.player.id,
            organId: o.id,
            organColor: o.color,
          });
        }
      }
    }

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
        case TreatmentSubtype.OrganThief:
          for (const p of st.players) {
            for (const o of p.board) {
              this.targetOptions.push({
                playerName: p.player.name,
                playerId: p.player.id,
                organId: o.id,
                organColor: o.color,
              });
            }
          }
          break;
        case TreatmentSubtype.MedicalError:
          for (const p of st.players) {
            if (p.player.id !== this._apiPlayer.player()?.id) {
              this.targetOptions.push({
                playerName: p.player.name,
                playerId: p.player.id,
                organId: '',
              });
            }
          }
          break;
        case TreatmentSubtype.Contagion:
          this.contagionAssignments = [];
          const me = this._apiPlayer.player();
          const self = st.players.find((p) => p.player.id === me?.id);
          if (!self) return;

          for (const o of self.board) {
            const virusCount = o.attached.filter(
              (a) => a.kind === 'virus'
            ).length;
            for (let i = 0; i < virusCount; i++) {
              this.contagionAssignments.push({
                fromOrganId: o.id,
                toOrganId: '',
                toPlayerId: '',
              });
            }
          }
          break;
      }
    }
  }

  onTargetChange(value: string, which: 'A' | 'B' | 'single' = 'single') {
    if (!value) {
      if (which === 'A') this.selectedTargetA = null;
      else if (which === 'B') this.selectedTargetB = null;
      else this.selectedTarget = null;
      return;
    }
    const [organId, playerId] = value.split('|');
    const target = { organId, playerId };

    if (which === 'A') this.selectedTargetA = target;
    else if (which === 'B') this.selectedTargetB = target;
    else this.selectedTarget = target;
  }

  onContagionTargetChange(value: string, idx: number) {
    if (!value) {
      this.contagionAssignments[idx].toOrganId = '';
      this.contagionAssignments[idx].toPlayerId = '';
      return;
    }
    const [organId, playerId] = value.split('|');
    this.contagionAssignments[idx].toOrganId = organId;
    this.contagionAssignments[idx].toPlayerId = playerId;
  }

  get canConfirmSelection(): boolean {
    if (!this.selectedCard) return false;

    if (this.selectedCard.kind === CardKind.Treatment) {
      switch (this.selectedCard.subtype) {
        case TreatmentSubtype.Transplant:
          return (
            !!this.selectedTargetA &&
            !!this.selectedTargetB &&
            this.selectedTargetA.organId !== this.selectedTargetB.organId
          );
        case TreatmentSubtype.OrganThief:
        case TreatmentSubtype.MedicalError:
          return !!this.selectedTarget;
        case TreatmentSubtype.Contagion:
          return (
            this.contagionAssignments.length > 0 &&
            this.contagionAssignments.every(
              (assignment) => assignment.toOrganId && assignment.toPlayerId
            )
          );
        default:
          return true;
      }
    }

    if (
      this.selectedCard.kind === CardKind.Virus ||
      this.selectedCard.kind === CardKind.Medicine
    ) {
      return !!this.selectedTarget;
    }

    return true;
  }

  confirmPlayCard() {
    if (!this.selectedCard) return;

    const st = this.publicState;
    const me = this._apiPlayer.player();
    if (!st || !me) return;

    let target: any = undefined;

    if (this.selectedCard.kind === CardKind.Treatment) {
      switch (this.selectedCard.subtype) {
        case TreatmentSubtype.Transplant:
          if (!this.selectedTargetA || !this.selectedTargetB) {
            alert('Debes seleccionar 2 órganos para el trasplante');
            return;
          }
          target = { a: this.selectedTargetA, b: this.selectedTargetB };
          break;
        case TreatmentSubtype.OrganThief:
          if (!this.selectedTarget) {
            alert('Debes seleccionar un órgano');
            return;
          }
          target = this.selectedTarget;
          break;
        case TreatmentSubtype.MedicalError:
          if (!this.selectedTarget) {
            alert('Debes seleccionar un jugador');
            return;
          }
          target = { playerId: this.selectedTarget.playerId };
          break;
        case TreatmentSubtype.Contagion:
          if (!this.contagionAssignments.length) {
            alert('Debes seleccionar los contagios');
            return;
          }
          this._gameStore.playCard(
            st.roomId,
            this.selectedCard.id,
            this.contagionAssignments
          );
          this.clearSelection();
          return;
      }
    } else if (
      this.selectedCard.kind === CardKind.Virus ||
      this.selectedCard.kind === CardKind.Medicine
    ) {
      if (!this.selectedTarget) {
        alert('Debes seleccionar un órgano');
        return;
      }
      target = this.selectedTarget;
    }

    this.playCard(this.selectedCard.id, target);
    this.clearSelection();
  }

  playCard(cardId: string, target?: AnyPlayTarget) {
    const st = this.publicState;
    if (!st) return;
    this._gameStore.playCard(st.roomId, cardId, target);
  }

  clearSelection() {
    this.selectedCard = null;
    this.selectedTarget = null;
    this.selectedTargetA = null;
    this.selectedTargetB = null;
    this.targetOptions = [];
    this.contagionAssignments = [];
  }

  private setupPanelObserver() {
    if (!this._handPanel) return;

    this.teardownPanelObserver();

    const element = this._handPanel.nativeElement;
    const updateHeight = (height: number) => {
      this._ngZone.run(() => {
        this.panelSpacerHeight = Math.max(0, Math.round(height));
      });
    };

    if (typeof ResizeObserver === 'undefined') {
      updateHeight(element.getBoundingClientRect().height);
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          let height = entry.contentRect.height;
          const borderBoxSizes = (entry as ResizeObserverEntry & {
            borderBoxSize?: any;
          }).borderBoxSize;

          if (borderBoxSizes) {
            const firstEntry = Array.isArray(borderBoxSizes)
              ? borderBoxSizes[0]
              : borderBoxSizes;
            if (firstEntry && typeof firstEntry.blockSize === 'number') {
              height = firstEntry.blockSize;
            }
          }

          updateHeight(height);
        }
      });
      this._resizeObserver.observe(element);
      updateHeight(element.getBoundingClientRect().height);
    });
  }

  private teardownPanelObserver() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }
}

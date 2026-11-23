import { Component, inject, OnChanges, SimpleChanges, input, computed, ElementRef, AfterViewInit, OnDestroy, output } from '@angular/core';
import { Card, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { GameStoreService } from '@core/services/game-store.service';
import { SocketService } from '@core/services/socket/socket.service';
import { TargetSelectComponent } from './target-select/target-select.component';
import { HandActionService } from './services/hand-action.service';
import { HandDiscardService } from './services/hand-discard.service';
import { ApparitionBannerComponent } from './components/apparition-banner/apparition-banner.component';
import { HandListComponent } from './components/hand-list/hand-list.component';
import { DiscardActionButtonComponent } from './components/discard-action-button/discard-action-button.component';
import { PassTurnButtonComponent } from './components/pass-turn-button/pass-turn-button.component';
import { EmoteTrayComponent } from './components/emote-tray/emote-tray.component';
import { HandStateService } from './services/hand-state.service';
import { HandStrategyResolverService } from './services/hand-strategy-resolver.service';
import { HandUIHelperService } from './services/hand-ui-helper.service';

@Component({
  selector: 'game-hand',
  standalone: true,
  imports: [TargetSelectComponent, ApparitionBannerComponent, HandListComponent, DiscardActionButtonComponent, EmoteTrayComponent, PassTurnButtonComponent],
  templateUrl: './game-hand.html',
  styleUrl: './game-hand.css',
  providers: [HandActionService, HandStateService, HandDiscardService, HandStrategyResolverService, HandUIHelperService],
  host: { '[class.is-my-turn]': 'isMyTurn()' }
})
export class GameHandComponent implements OnChanges, AfterViewInit, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _resizeObserver?: ResizeObserver;

  heightChange = output<number>();
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private _socket = inject(SocketService);
  handAction = inject(HandActionService);
  handUIHelper = inject(HandUIHelperService);
  handDiscard = inject(HandDiscardService);
  apiPlayer = this._apiPlayer;
  hand = input<Card[]>([]);
  isMyTurn = input(false);
  roomId = input<string | null>(null);
  publicState = input<PublicGameState | null>(null);
  gameEnded = input(false);

  /** true mientras la conexión no está establecida: desactiva acciones de mano. */
  readonly offline = computed(() => this._socket.connectionStatus() !== 'online');

  readonly mustPlayCardId = computed(() => {
    const st = this.publicState();
    const me = this._apiPlayer.player();
    if (!st || !me || !st.pendingAction) return null;
    if (
      st.pendingAction.type === 'ApparitionDecision' &&
      st.pendingAction.playerId === me.id
    ) {
      return st.pendingAction.cardId;
    }
    return null;
  });

  /**
   * «Pasar turno»: salida de un turno sin jugar (reglamento: jugada `game:end-turn`).
   * Deshabilitado fuera de turno, offline, con Aparición pendiente (el banner la gestiona),
   * mientras se elige objetivo o al terminar la partida.
   */
  readonly passTurnDisabled = computed(() =>
    !this.isMyTurn() || this.gameEnded() || this.offline() ||
    !!this.mustPlayCardId() || !!this.handAction.selectedCard()
  );

  /** Verbo del botón: por defecto «Pasar turno», o el motivo del bloqueo. */
  readonly passTurnLabel = computed(() => {
    if (this.offline()) return 'Sin conexión';
    if (this.mustPlayCardId()) return 'Resuelve la Aparición';
    if (this.gameEnded()) return 'Partida terminada';
    return 'Pasar turno';
  });

  passTurn() {
    if (this.passTurnDisabled()) return;
    this._gameStore.endTurn(this.roomId()!);
  }

  // ── Aparición: pista contextual mientras la carta está en mano ─────────
  readonly hasApparitionCard = computed(() =>
    this.hand().some(
      (c) => c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.Apparition
    )
  );

  /** Visible mientras la Aparición está en mano (el banner toma el relevo con la decisión pendiente). */
  readonly showApparitionHint = computed(() =>
    this.hasApparitionCard() && !this.mustPlayCardId()
  );

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
      this.handAction.clearSelection();
    }

    if (turnChange.previousValue && !turnChange.currentValue) {
      this.handAction.clearSelection();
      this.handDiscard.reset();
    }
  }

  ngAfterViewInit() {
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.heightChange.emit(entry.contentRect.height);
      }
    });
    this._resizeObserver.observe(this._elementRef.nativeElement);
  }

  ngOnDestroy() {
    this._resizeObserver?.disconnect();
  }

  selectCardToPlay(card: Card) {
    this.handAction.selectCard(card, this.publicState());
  }

  selectCardAndTarget(card: Card, target: PlayCardTarget) {
    this.handAction.selectCard(card, this.publicState());
    this.handUIHelper.setTarget(target);
    this.handUIHelper.setDragDropSelection(true);
  }
  
  keepApparitionCard() {
    if (!this.mustPlayCardId()) return;
    const st = this.publicState();
    if (st) this._gameStore.endTurn(st.roomId);
  }
}

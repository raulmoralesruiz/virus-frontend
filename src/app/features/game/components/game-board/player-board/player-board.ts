import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { PlayerCardComponent } from './player-card/player-card';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  articleForCard,
  cardWithArticle,
  describeCard,
  describeColor,
  describeOrgan,
  organWithArticle,
} from '../../../../../core/utils/card-label.utils';
import { isInfected, isVaccinated, isImmune } from '../../../../../core/utils/organ.utils';
import {
  MedicalErrorTarget,
  OrganOnBoard,
  PublicGameState,
  PublicPlayerInfo,
} from '../../../../../core/models/game.model';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';
import { TimerSoundService } from '../../../../../core/services/timer-sound.service';
import { DragDropService } from '../../../../../core/services/drag-drop.service';


import { PlayerBoardHeaderComponent } from './components/player-board-header/player-board-header.component';

import { PlayerBoardDropService } from './services/player-board-drop.service';
import { BoardDragPredicates } from './logic/board-drag-predicates';
import { BoardContagionService } from './services/board-contagion.service';
import { BoardActionService } from './services/board-action.service';

@Component({
  selector: 'player-board',
  standalone: true,
  imports: [PlayerCardComponent, DragDropModule, PlayerBoardHeaderComponent],
  providers: [
    PlayerBoardDropService,
    BoardContagionService,
    BoardActionService
  ],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
})
export class PlayerBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private dragDropService = inject(DragDropService);
  private dropService = inject(PlayerBoardDropService);
  private predicates = inject(BoardDragPredicates);
  private contagionService = inject(BoardContagionService);
  private actionService = inject(BoardActionService);

  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  isActive = input(false);
  roomId = input.required<string>();
  gameState = input.required<PublicGameState>();
  remainingSeconds = input(0);
  getTemporaryVirusesForOrgan =
    input.required<(organId: string, playerId: string) => Card[]>();
  hasTemporaryVirus =
    input.required<(organId: string, playerId: string) => boolean>();

  isValidBoardTarget = computed(() => {
    const dragged = this.dragDropService.draggedItem();
    if (!dragged) return false;

    // Solo nos interesa si es un Órgano y es MI tablero
    // dragged puede ser Card o {virusId...}
    if ('kind' in dragged) {
      const card = dragged as Card;
      
      if (card.kind === CardKind.Organ) {
          if (card.color === CardColor.Orange) {
              // Órgano mutante: NO se puede soltar en el tablero general (solo en slots)
              return false;
          }
          return this.isMe();
      }

      if (card.kind === CardKind.Treatment) {
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
            return true; // Todos los tableros

          case TreatmentSubtype.MedicalError:
          case TreatmentSubtype.trickOrTreat:
            return !this.isMe(); // Solo rivales

          case TreatmentSubtype.Contagion:
            return this.isMe(); // Solo propio
        }
      }
    }
    
    return false;
  });

  // connectedTo devuelve el id de la mano local (para permitir drops desde tu mano)
  connectedTo = computed(() => {
    const me = this._apiPlayer.player();
    if (!me) return [];
    return [`handList-${me.id}`];
  });

  turnTimerState = computed<'idle' | 'running' | 'warning' | 'critical'>(() => {
    if (!this.isActive()) return 'idle';

    const seconds = this.remainingSeconds();
    if (seconds <= 5) return 'critical';
    if (seconds <= 10) return 'warning';
    return 'running';
  });

  turnDurationSeconds = signal(0);

  turnProgressPercent = computed(() => {
    const duration = this.turnDurationSeconds();
    if (duration <= 0) return 0;

    const ratio = this.remainingSeconds() / duration;
    return Math.max(0, Math.min(100, ratio * 100));
  });

  private readonly timerSoundService = inject(TimerSoundService);
  isMuted = this.timerSoundService.isMuted;

  constructor() {
    effect(() => {
      const remaining = this.remainingSeconds();
      const currentDuration = this.turnDurationSeconds();

      if (remaining > currentDuration) {
        this.turnDurationSeconds.set(remaining);
      }
    });

    let wasActive = false;
    effect(() => {
      const isActive = this.isActive();
      const isMe = this.isMe();
      const seconds = this.remainingSeconds(); // fuerza ejecución cada segundo
      const timerState = this.turnTimerState();

      if (!isMe) {
        wasActive = false;
        return;
      }

      if (isActive && !wasActive) {
        this.timerSoundService.playTurnStart();
      }

      wasActive = isActive;

      if (!isActive) {
        return;
      }

      this.playTickForState(timerState);
    });
    effect(() => {
      // Resetear el estado visual de drag-over cuando termina un arrastre globalmente
      if (!this.dragDropService.draggedItem()) {
        this.isDragOver.set(false);
      }
    });
  }

  private playTickForState(
    timerState: 'idle' | 'running' | 'warning' | 'critical'
  ) {
    if (this.isMuted()) {
      return; // No hacer nada si está silenciado
    }

    switch (timerState) {
      case 'warning':
        this.timerSoundService.playTick('warning');
        break;
      case 'critical':
        this.timerSoundService.playTick('critical');
        break;
      default:
        break;
    }
  }

  toggleMute() {
    this.timerSoundService.toggleMute();
  }

  // recibir la lista global de ids de huecos
  allSlotIds = input.required<string[]>();

  // --- Inputs / Outputs ---
  contagionState = input<{
    card: Card;
    assignments: {
      fromOrganId: string;
      toOrganId: string;
      toPlayerId: string;
    }[];
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null>(null);

  virusMoved = output<{
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
    virus: Card;
  }>();

  startContagion = output<{ card: Card }>();
  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();

  // recibe el estado global de trasplante
  transplantState = input<{
    card: Card;
    firstOrgan: { organId: string; playerId: string } | null;
  } | null>(null);

  startTransplant = output<{
    card: Card;
    firstOrgan: { organId: string; playerId: string };
  }>();

  finishTransplant = output<{ organId: string; playerId: string }>();

  startFailedExperiment = output<{
    card: Card;
    target: { organId: string; playerId: string };
  }>();

  // ------------------------------------------------------------
  // Eventos de drag & drop
  // ------------------------------------------------------------
  boardDropListId(): string {
    return `board-${this.player().player.id}`;
  }

  // Drag over state for visual feedback
  isDragOver = signal(false);

  boardEnterPredicate = (drag: CdkDrag, drop: CdkDropList<any>) =>
    this.predicates.checkBoardEnter(drag, drop, this.player(), this.isMe());

  slotEnterPredicate = (drag: CdkDrag, drop: CdkDropList<any>) =>
    this.predicates.checkSlotEnter(drag, drop, this.player(), this.isMe());

  onBoardEnter(_event: any) {
    this.isDragOver.set(true);
  }

  onBoardExit(_event: any) {
    this.isDragOver.set(false);
  }

  onBoardDrop(event: CdkDragDrop<any>) {
    const rid = this.roomId();
    const card = event.item.data as Card;
    
    this.isDragOver.set(false);

    if (card.kind === CardKind.Treatment) {
        if (card.subtype === TreatmentSubtype.BodySwap) { this.startBodySwap.emit({card}); return; }
        if (card.subtype === TreatmentSubtype.Apparition) { this.startApparition.emit({card}); return; }
        if (card.subtype === TreatmentSubtype.Contagion) { this.playContagion(card); return; }
    }

    this.dropService.handleBoardDrop(event, rid, this.player(), this.isMe());
  }

  onDrop(
    event: CdkDragDrop<any>,
    color: CardColor,
    organ?: OrganOnBoard | null
  ) {
    if (this.contagionState()) {
      if (!organ) {
        this._gameStore.setClientError(
          'Debes contagiar un órgano válido.'
        );
        return;
      }
      this.onVirusDrop(event, organ);
    } else {
      this.onSlotDrop(event, color);
    }
  }

  /**
   * Maneja el drop sobre un hueco concreto (color).
   * Delegamos por tipo de carta a métodos auxiliares.
   */
  onSlotDrop(event: CdkDragDrop<any>, color: CardColor) {
    const card: Card = event.item.data;
    const rid = this.roomId();
    const meId = this._apiPlayer.player()?.id;

    if (!rid || !meId) return;

    // Handle special mode initiators locally
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

  // Método mejorado para manejar el drop de virus
  onVirusDrop(event: CdkDragDrop<any>, organ: OrganOnBoard) {
    const data = event.item.data; // { fromOrganId, virusId }
    const contagionState = this.contagionState();
    if (!contagionState) return;

    console.log(`onVirusDrop - data:${JSON.stringify(data)}`);
    const result = this.contagionService.validateVirusDrop(
      event,
      organ,
      this.contagionState(),
      this.isMe(),
      this.player().player.id,
      this.hasTemporaryVirus(),
      this.gameState()
    );

    if (result) {
      this.virusMoved.emit(result);
    }
  }

  // Método helper para verificar si un virus es temporal
  isTemporaryVirus(organId: string, virusId: string): boolean {
    const contagionState = this.contagionState();
    if (!contagionState) return false;

    return contagionState.temporaryViruses.some(
      (tv) => tv.organId === organId && tv.virus.id === virusId
    );
  }

  // ------------------------------------------------------------
  // Métodos auxiliares por tipo de carta
  // ------------------------------------------------------------

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

  /**
   * Comienza la selección para Trasplante: guardamos el primer órgano (A)
   * y avisamos al usuario para que seleccione el segundo órgano (B) haciendo click.
   */
  private startTransplantSelection(card: Card, color: CardColor) {
    const result = this.actionService.validateTransplantSelection(card, color, this.player());
    if (result) {
      this.startTransplant.emit(result);
    }
  }

  /**
   * Método público llamado al hacer click en un hueco cuando estamos en modo Transplant.
   * Si se pulsa en un órgano válido, termina el trasplante enviando la jugada al servidor.
   */
  onSlotClick(organ: any, playerId: string) {
    const result = this.actionService.validateSlotClick(organ, playerId, this.transplantState());
    if (result) {
      this.finishTransplant.emit(result);
    }
  }

  // ------------------------------------------------------------
  // Helpers para estilos visuales
  // ------------------------------------------------------------

  isTransplantMode(): boolean {
    return !!this.transplantState;
  }

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  // getOrganByColor(color: CardColor): OrganOnBoard {
  //   return this.player().board.find((o) => o.color === color)!;
  // }
  getOrganByColor(color: CardColor): OrganOnBoard | null {
    return this.player().board.find((o) => o.color === color) ?? null;
  }

  // helper para construir la lista de ids a conectar para UN hueco concreto (excluye el propio)
  getConnectedIdsForSlot(color: CardColor): string[] {
    const me = this._apiPlayer.player();
    const result: string[] = [];

    // 1) la mano local (si existe)
    if (me) {
      result.push(`handList-${me.id}`);
    }

    // 2) todos los demás huecos (excepto este hueco concreto)
    const mySlotId = `slot-${this.player().player.id}-${color}`;
    const others = this.allSlotIds().filter((id) => id !== mySlotId);
    result.push(...others);

    return result;
  }

  onEnterBoard(event: any) {
    // entrada visual / debugging
    const card = event.item?.data;
    const who = this.player()?.player?.name;
    console.log(`[ENTER] Carta ${card?.id ?? card} entró en tablero de ${who}`);
  }
}

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
import { DragDropService } from '../../../../../core/services/drag-drop.service';


import { PlayerBoardHeaderComponent } from './components/player-board-header/player-board-header.component';

import { PlayerBoardDropService } from './services/player-board-drop.service';
import { BoardDragPredicates } from './logic/board-drag-predicates';
import { BoardContagionService } from './services/board-contagion.service';
import { BoardActionService } from './services/board-action.service';
import { ContagionState, FailedExperimentEvent, TransplantSelectionEvent, TransplantState, VirusDropEvent } from './player-board.models';

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



  constructor() {
    effect(() => {
      // Resetear el estado visual de drag-over cuando termina un arrastre globalmente
      if (!this.dragDropService.draggedItem()) {
        this.isDragOver.set(false);
      }
    });
  }



  // recibir la lista global de ids de huecos
  allSlotIds = input.required<string[]>();

  // --- Inputs / Outputs ---
  contagionState = input<ContagionState | null>(null);
  virusMoved = output<VirusDropEvent>();
  startContagion = output<{ card: Card }>();
  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();
  transplantState = input<TransplantState | null>(null);
  startTransplant = output<TransplantSelectionEvent>();
  finishTransplant = output<{ organId: string; playerId: string }>();
  startFailedExperiment = output<FailedExperimentEvent>();

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

  isTransplantMode(): boolean {
    return !!this.transplantState;
  }

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

}

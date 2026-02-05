import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
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
  providers: [
    PlayerBoardDropService,
    BoardContagionService,
    BoardActionService
  ],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
  host: {
    '[class.is-me]': 'isMe()',
    '[class.is-active]': 'isActive()',
    'class': 'player-board' // Mantener la clase para selectores externos si es necesario, o migrar estilos a :host
  }
})
export class PlayerBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private dragDropService = inject(DragDropService);
  private dropService = inject(PlayerBoardDropService);
  private predicates = inject(BoardDragPredicates);
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

  playContagion(card: Card) {
    if (this.actionService.validateContagion(card, this.isMe())) {
      this.startContagion.emit({ card });
    }
  }

}

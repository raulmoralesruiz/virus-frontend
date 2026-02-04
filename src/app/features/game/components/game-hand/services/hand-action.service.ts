import { Injectable, signal, computed, inject } from '@angular/core';
import { Card, CardKind, CardColor, TreatmentSubtype } from '../../../../../core/models/card.model';
import { PublicGameState, PlayCardTarget } from '../../../../../core/models/game.model';
import { TargetSelectOption } from '../target-select/target-select.models';
import { CardActionStrategy } from '../strategies/card-action.strategy';
import { StandardStrategy } from '../strategies/standard.strategy';
import { TransplantStrategy } from '../strategies/transplant.strategy';
import { ThiefStrategy } from '../strategies/thief.strategy';
import { PlayerTargetStrategy } from '../strategies/player-target.strategy';
import { ContagionStrategy } from '../strategies/contagion.strategy';
import { FailedExperimentStrategy } from '../strategies/failed-experiment.strategy';
import { BodySwapStrategy } from '../strategies/body-swap.strategy';
import { SimplePlayStrategy } from '../strategies/simple-play.strategy';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';

@Injectable()
export class HandActionService {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);

  // State Signals
  selectedCard = signal<Card | null>(null);
  targetOptions = signal<TargetSelectOption[]>([]);
  
  // Selection State
  selectedTarget = signal<PlayCardTarget | null>(null);
  selectedTargetA = signal<PlayCardTarget | null>(null);
  selectedTargetB = signal<PlayCardTarget | null>(null);
  selectedDirection = signal<'clockwise' | 'counter-clockwise' | null>(null);
  selectedActionForFailedExperiment = signal<'medicine' | 'virus' | null>(null);
  
  // Contagion specialized state
  contagionAssignments = signal<{ fromOrganId: string; toOrganId: string; toPlayerId: string }[]>([]);

  isDragDropSelection = signal(false);

  // Derived State
  private strategies = new Map<string, CardActionStrategy>();
  private readonly currentStrategy = computed(() => {
     const card = this.selectedCard();
     return card ? this.resolveStrategy(card) : null;
  });

  readonly canConfirmSelection = computed(() => {
    const strategy = this.currentStrategy();
    const card = this.selectedCard();
    if (!strategy || !card) return false;
    
    // Aggregate current selection state
    const selection = {
      selectedTarget: this.selectedTarget(),
      selectedTargetA: this.selectedTargetA(),
      selectedTargetB: this.selectedTargetB(),
      selectedDirection: this.selectedDirection(),
      selectedActionForFailedExperiment: this.selectedActionForFailedExperiment(),
      contagionAssignments: this.contagionAssignments(),
    };

    return strategy.canPlay(selection);
  });

  constructor() {
    this.strategies.set('standard', new StandardStrategy());
    this.strategies.set('transplant', new TransplantStrategy());
    this.strategies.set('thief', new ThiefStrategy());
    this.strategies.set('player', new PlayerTargetStrategy());
    this.strategies.set('contagion', new ContagionStrategy());
    this.strategies.set('failedExperiment', new FailedExperimentStrategy());
    this.strategies.set('bodySwap', new BodySwapStrategy());
    this.strategies.set('simple', new SimplePlayStrategy());
  }

  selectCard(card: Card, gameState: PublicGameState | null) {
    if (this.selectedCard()?.id === card.id) {
      this.clearSelection();
      return;
    }

    this.clearSelection();
    this.selectedCard.set(card);

    if (!gameState) return;

    // Strategy is now derived, just check if we need to init special states
    // We need to peek at the resolved strategy or just check the card kind derivedly
    const strategy = this.resolveStrategy(card);
    
    if (strategy) {
       this.initializeSpecialStates(card, gameState);
       const options = strategy.getTargets(gameState, card, this._apiPlayer.player()?.id);
       this.targetOptions.set(options);
    }
  }

  confirmPlay(roomId: string) {
    const card = this.selectedCard();
    const strategy = this.currentStrategy();
    
    if (!card || !strategy || !roomId) return;

    if (!this.canConfirmSelection()) {
        this._gameStore.setClientError('Selección inválida o incompleta');
        return;
    }

    const selection = {
        selectedTarget: this.selectedTarget(),
        selectedTargetA: this.selectedTargetA(),
        selectedTargetB: this.selectedTargetB(),
        selectedDirection: this.selectedDirection(),
        selectedActionForFailedExperiment: this.selectedActionForFailedExperiment(),
        contagionAssignments: this.contagionAssignments(),
    };

    const payload = strategy.getPlayPayload(selection);
    this._gameStore.playCard(roomId, card.id, payload);
    this.clearSelection();
  }

  playCardDirectly(cardId: string, payload: any, roomId: string) {
      this._gameStore.playCard(roomId, cardId, payload);
  }

  clearSelection() {
    this.selectedCard.set(null);
    this.targetOptions.set([]);
    this.selectedTarget.set(null);
    this.selectedTargetA.set(null);
    this.selectedTargetB.set(null);
    this.selectedDirection.set(null);
    this.selectedActionForFailedExperiment.set(null);
    this.contagionAssignments.set([]);
    this.isDragDropSelection.set(false);
    // this.currentStrategy is now computed, no need to reset
  }

  private resolveStrategy(card: Card): CardActionStrategy | null {
    if (card.kind === CardKind.Virus || card.kind === CardKind.Medicine) {
      return this.strategies.get('standard')!;
    }
    
    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
        return this.strategies.get('standard')!; // Handles orange replacement logic too
    }

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
        case TreatmentSubtype.AlienTransplant:
          return this.strategies.get('transplant')!;
        case TreatmentSubtype.OrganThief:
        case TreatmentSubtype.colorThiefRed:
        case TreatmentSubtype.colorThiefGreen:
        case TreatmentSubtype.colorThiefBlue:
        case TreatmentSubtype.colorThiefYellow:
          return this.strategies.get('thief')!;
        case TreatmentSubtype.MedicalError:
        case TreatmentSubtype.trickOrTreat:
          return this.strategies.get('player')!;
        case TreatmentSubtype.Contagion:
          return this.strategies.get('contagion')!;
        case TreatmentSubtype.failedExperiment:
          return this.strategies.get('failedExperiment')!;
        case TreatmentSubtype.BodySwap:
          return this.strategies.get('bodySwap')!;
      }
    }
    // Default fallback for normal organs and any other non-targeting card
    return this.strategies.get('simple')!;
  }

  private initializeSpecialStates(card: Card, gameState: PublicGameState) {
    if (card.kind === CardKind.Treatment && card.subtype === TreatmentSubtype.Contagion) {
        const me = this._apiPlayer.player();
        const self = gameState.players.find((p) => p.player.id === me?.id);
        if (!self) return;

        const assignments: any[] = [];
        for (const o of self.board) {
        const virusCount = o.attached.filter(
            (a) => a.kind === 'virus'
        ).length;
        for (let i = 0; i < virusCount; i++) {
            assignments.push({
            fromOrganId: o.id,
            toOrganId: '',
            toPlayerId: '',
            });
        }
        }
        this.contagionAssignments.set(assignments);
    }
  }

  // Setters/Updaters for UI binding
  setTarget(target: PlayCardTarget | null) { this.selectedTarget.set(target); }
  setTargetA(target: PlayCardTarget | null) { this.selectedTargetA.set(target); }
  setTargetB(target: PlayCardTarget | null) { this.selectedTargetB.set(target); }
  setDirection(dir: 'clockwise' | 'counter-clockwise' | null) { this.selectedDirection.set(dir); }
  setActionForFailedExperiment(action: 'medicine' | 'virus' | null) { this.selectedActionForFailedExperiment.set(action); }
  
  updateContagionAssignment(index: number, organId: string, playerId: string) {
      this.contagionAssignments.update(current => {
          const next = [...current];
          if (next[index]) {
              next[index].toOrganId = organId;
              next[index].toPlayerId = playerId;
          }
          return next;
      });
  }
}

import { Injectable, computed, inject } from '@angular/core';
import { Card } from '@core/models/card.model';
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { HandStrategyResolverService } from './hand-strategy-resolver.service';
import { HandStateService } from './hand-state.service';

@Injectable()
export class HandActionService {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);
  private _strategyResolver = inject(HandStrategyResolverService);
  private _state = inject(HandStateService);

  // Expose State Signals
  readonly selectedCard = this._state.selectedCard;
  readonly targetOptions = this._state.targetOptions;
  readonly selectedTarget = this._state.selectedTarget;
  readonly selectedTargetA = this._state.selectedTargetA;
  readonly selectedTargetB = this._state.selectedTargetB;
  readonly selectedDirection = this._state.selectedDirection;
  readonly selectedActionForFailedExperiment = this._state.selectedActionForFailedExperiment;
  readonly contagionAssignments = this._state.contagionAssignments;
  readonly isDragDropSelection = this._state.isDragDropSelection;

  // Derived State
  private readonly currentStrategy = computed(() => {
     const card = this.selectedCard();
     return card ? this._strategyResolver.resolve(card) : null;
  });

  readonly canConfirmSelection = computed(() => {
    const strategy = this.currentStrategy();
    if (!strategy) return false;
    
    return strategy.canPlay(this.getCurrentSelectionState());
  });

  selectCard(card: Card, gameState: PublicGameState | null) {
    if (this.selectedCard()?.id === card.id) {
      this.clearSelection();
      return;
    }

    this.clearSelection();
    this._state.selectedCard.set(card);

    if (!gameState) return;

    const strategy = this._strategyResolver.resolve(card);
    
    this.initializeSpecialStates(card, gameState);
    const options = strategy.getTargets(gameState, card, this._apiPlayer.player()?.id);
    this._state.targetOptions.set(options);
  }

  confirmPlay(roomId: string) {
    const card = this.selectedCard();
    const strategy = this.currentStrategy();
    
    if (!card || !strategy || !roomId) return;

    if (!this.canConfirmSelection()) {
        this._gameStore.setClientError('Selección inválida o incompleta');
        return;
    }

    const payload = strategy.getPlayPayload(this.getCurrentSelectionState());
    this._gameStore.playCard(roomId, card.id, payload);
    this.clearSelection();
  }

  clearSelection() {
    this._state.clear();
  }

  // Helpers (delegating to state)
  private initializeSpecialStates(card: Card, gameState: PublicGameState) {
    if (card.kind === 'treatment' && card.subtype === 'contagion') {
        const me = this._apiPlayer.player();
        const self = gameState.players.find((p) => p.player.id === me?.id);
        if (!self) return;

        const assignments = [];
        for (const o of self.board) {
            const virusCount = o.attached.filter(a => a.kind === 'virus').length;
            for (let i = 0; i < virusCount; i++) {
                assignments.push({ fromOrganId: o.id, toOrganId: '', toPlayerId: '' });
            }
        }
        this._state.contagionAssignments.set(assignments);
    }
  }

  private getCurrentSelectionState() {
     return {
        selectedTarget: this.selectedTarget(),
        selectedTargetA: this.selectedTargetA(),
        selectedTargetB: this.selectedTargetB(),
        selectedDirection: this.selectedDirection(),
        selectedActionForFailedExperiment: this.selectedActionForFailedExperiment(),
        contagionAssignments: this.contagionAssignments(),
     };
  }
}

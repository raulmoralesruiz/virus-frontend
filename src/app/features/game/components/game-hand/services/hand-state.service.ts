import { Injectable, signal } from '@angular/core';
import { Card } from '../../../../../core/models/card.model';
import { PlayCardTarget } from '../../../../../core/models/game.model';
import { TargetSelectOption } from '../target-select/target-select.models';

@Injectable()
export class HandStateService {
  // State Signals
  readonly selectedCard = signal<Card | null>(null);
  readonly targetOptions = signal<TargetSelectOption[]>([]);
  
  // Selection State
  readonly selectedTarget = signal<PlayCardTarget | null>(null);
  readonly selectedTargetA = signal<PlayCardTarget | null>(null);
  readonly selectedTargetB = signal<PlayCardTarget | null>(null);
  readonly selectedDirection = signal<'clockwise' | 'counter-clockwise' | null>(null);
  readonly selectedActionForFailedExperiment = signal<'medicine' | 'virus' | null>(null);
  
  // Contagion specialized state
  readonly contagionAssignments = signal<{ fromOrganId: string; toOrganId: string; toPlayerId: string }[]>([]);

  readonly isDragDropSelection = signal(false);

  clear() {
    this.selectedCard.set(null);
    this.targetOptions.set([]);
    this.selectedTarget.set(null);
    this.selectedTargetA.set(null);
    this.selectedTargetB.set(null);
    this.selectedDirection.set(null);
    this.selectedActionForFailedExperiment.set(null);
    this.contagionAssignments.set([]);
    this.isDragDropSelection.set(false);
  }
}

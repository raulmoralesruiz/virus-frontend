import { Component, input, output, computed } from '@angular/core';
import { Card } from '@core/models/card.model';
import { PlayCardTarget, PublicGameState } from '@core/models/game.model';
import { TargetSelectOption, PlayerOption } from './target-select.models';
import { getCardEffectDescription, getInstruction, toOptionValue, getCardKindLabel, getCardColorLabel, getCardSubtypeLabel } from './target-select.utils';
import { 
  getRequiresTargetSelection, isTransplantCard, isContagionCard, 
  isFailedExperimentCard, isPlayerOnlyCard, isBodySwapCard, isSelfTargetCard 
} from './target-select.predicates';
import { getPlayerOptions, shouldClearSelection, hasNoOptionsAvailable, filterTargetOptions } from './target-select.logic';
import { TARGET_SELECT_IMPORTS } from './target-select.imports';
import { setupTargetSelectEffects } from './target-select.setup';

@Component({
  selector: 'game-target-select',
  standalone: true,
  imports: TARGET_SELECT_IMPORTS,
  templateUrl: './target-select.component.html',
  styleUrl: './target-select.component.css',
})
export class TargetSelectComponent {
  selectedCard = input.required<Card>();
  targetOptions = input<TargetSelectOption[]>([]);
  contagionAssignments = input<{ fromOrganId: string; toOrganId: string; toPlayerId: string; }[]>([]);
  publicState = input<PublicGameState | null>(null);
  confirmDisabled = input(false);
  isMyTurn = input(false);
  isDragDrop = input(false);
  selectedTarget = input<PlayCardTarget | null>(null);
  selectedTargetA = input<PlayCardTarget | null>(null);
  selectedTargetB = input<PlayCardTarget | null>(null);
  selectedAction = input<'medicine' | 'virus' | null>(null);
  selectedDirection = input<'clockwise' | 'counter-clockwise' | null>(null);

  targetChange = output<{ value: string; which: 'A' | 'B' | 'single' }>();
  contagionTargetChange = output<{ value: string; index: number }>();
  actionChange = output<'medicine' | 'virus' | null>();
  directionChange = output<'clockwise' | 'counter-clockwise' | null>();
  confirm = output<void>(); 
  cancel = output<void>();

  singleSelectionValue = '';
  singlePlayerSelection = '';
  transplantSelectionA = '';
  transplantPlayerA = '';
  transplantSelectionB = '';
  transplantPlayerB = '';

  myPlayerId = computed(() => {
    const state = this.publicState();
    if (!state || !this.isMyTurn()) return undefined;
    const playerInfo = state.players[state.turnIndex];
    return playerInfo?.player.id;
  });

  myOrganColors = computed(() => {
    const state = this.publicState();
    if (!state || !this.isMyTurn()) return [];
    const playerInfo = state.players[state.turnIndex];
    return playerInfo?.board.map(organ => organ.color) ?? [];
  });

  filteredTargetOptions = computed(() => filterTargetOptions(this.targetOptions(), this.selectedCard(), this.myPlayerId(), this.myOrganColors()));

  constructor() {
    setupTargetSelectEffects(this);
  }

  get cardKindLabel(): string { return getCardKindLabel(this.selectedCard()); }
  get cardColorLabel(): string { return getCardColorLabel(this.selectedCard()); }
  get cardSubtypeLabel(): string | null { return getCardSubtypeLabel(this.selectedCard()); }
  get instruction(): string {
    return getInstruction(this.selectedCard(), this.isTransplant, this.isContagion, this.requiresTargetSelection, getCardEffectDescription(this.selectedCard()));
  }

  get isTransplant(): boolean { return isTransplantCard(this.selectedCard()); }
  get isContagion(): boolean { return isContagionCard(this.selectedCard()); }
  get isFailedExperiment(): boolean { return isFailedExperimentCard(this.selectedCard()); }
  get isPlayerOnly(): boolean { return isPlayerOnlyCard(this.selectedCard()); }
  get isBodySwap(): boolean { return isBodySwapCard(this.selectedCard()); }
  get isSelfTarget(): boolean { return isSelfTargetCard(this.selectedCard()); }
  get requiresTargetSelection(): boolean { return getRequiresTargetSelection(this.selectedCard()); }

  get showSingleTarget(): boolean { return this.requiresSingleTarget && !this.isPlayerOnly; }
  private get requiresSingleTarget(): boolean { return this.requiresTargetSelection && !this.isTransplant && !this.isContagion && !this.isBodySwap; }
  get hasNoOptionsAvailable(): boolean {
    return hasNoOptionsAvailable(this.isPlayerOnly, this.isBodySwap, this.requiresSingleTarget, this.playerOptions.length, this.filteredTargetOptions().length);
  }

  get playerOptions(): PlayerOption[] { return getPlayerOptions(this.filteredTargetOptions()); }

  handleTargetChange(value: string, which: 'A' | 'B' | 'single' = 'single') {
    if (which === 'A') this.transplantSelectionA = value;
    if (which === 'B') this.transplantSelectionB = value;
    if (which === 'single') this.singleSelectionValue = value;
    this.targetChange.emit({ value, which });
  }

  handlePlayerChange(playerId: string, which: 'A' | 'B' | 'single') {
    if (which === 'single') {
        this.singlePlayerSelection = playerId;
        if (this.isPlayerOnly) { this.handleTargetChange(playerId ? `|${playerId}` : '', which); return; }
        if (shouldClearSelection(this.filteredTargetOptions(), playerId, this.singleSelectionValue)) this.handleTargetChange('', which);
    } else if (which === 'A') {
        this.transplantPlayerA = playerId;
        if (shouldClearSelection(this.filteredTargetOptions(), playerId, this.transplantSelectionA)) this.handleTargetChange('', which);
    } else {
        this.transplantPlayerB = playerId; 
        if (shouldClearSelection(this.filteredTargetOptions(), playerId, this.transplantSelectionB)) this.handleTargetChange('', which);
    }
  }
}


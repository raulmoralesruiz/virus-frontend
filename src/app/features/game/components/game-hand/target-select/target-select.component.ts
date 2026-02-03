import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card, CardColor, CardKind, TreatmentSubtype } from '../../../../../core/models/card.model';
import { PlayCardTarget, PublicGameState } from '../../../../../core/models/game.model';
import { TargetSelectOption, PlayerOption } from './target-select.models';
import { KIND_LABELS, COLOR_LABELS, TREATMENT_LABELS, getCardEffectDescription, getInstruction } from './target-select.texts';

import { TargetSelectTransplantComponent } from './components/target-select-transplant/target-select-transplant.component';
import { TargetSelectContagionComponent } from './components/target-select-contagion/target-select-contagion.component';
import { TargetSelectBodySwapComponent } from './components/target-select-body-swap/target-select-body-swap.component';
import { TargetSelectPlayerComponent } from './components/target-select-player/target-select-player.component';
import { TargetSelectStandardComponent } from './components/target-select-standard/target-select-standard.component';

@Component({
  selector: 'game-target-select',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    TargetSelectTransplantComponent,
    TargetSelectContagionComponent,
    TargetSelectBodySwapComponent,
    TargetSelectPlayerComponent,
    TargetSelectStandardComponent
  ],
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
  selectedTarget = input<PlayCardTarget | null>(null);
  selectedTargetA = input<PlayCardTarget | null>(null);
  selectedTargetB = input<PlayCardTarget | null>(null);
  selectedAction = input<'medicine' | 'virus' | null>(null);
  isDragDrop = input(false);
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

  constructor() {
    effect(() => {
      const value = this.selectedTarget();
      this.singleSelectionValue = this.toOptionValue(value);
      this.singlePlayerSelection = value?.playerId ?? '';
    });
    effect(() => {
      const value = this.selectedTargetA();
      this.transplantSelectionA = this.toOptionValue(value);
      this.transplantPlayerA = value?.playerId ?? '';
    });
    effect(() => {
      const value = this.selectedTargetB();
      this.transplantSelectionB = this.toOptionValue(value);
      this.transplantPlayerB = value?.playerId ?? '';
    });
    effect(() => {
      if (this.isSelfTarget && this.playerOptions.length >= 1 && !this.singlePlayerSelection) {
        this.handlePlayerChange(this.playerOptions[0].id, 'single');
      }
    });
  }

  get cardKindLabel(): string { return KIND_LABELS[this.selectedCard().kind]; }
  get cardColorLabel(): string { const c = this.selectedCard(); return COLOR_LABELS[c.color] ?? c.color; }
  get cardSubtypeLabel(): string | null {
    const c = this.selectedCard();
    return (c.kind === CardKind.Treatment && c.subtype) ? (TREATMENT_LABELS[c.subtype] ?? c.subtype) : null;
  }
  get instruction(): string {
    return getInstruction(this.selectedCard(), this.isTransplant, this.isContagion, this.requiresTargetSelection, getCardEffectDescription(this.selectedCard()));
  }

  get isTransplant(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Treatment && (c.subtype === TreatmentSubtype.Transplant || c.subtype === TreatmentSubtype.AlienTransplant); }
  get isContagion(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.Contagion; }
  get isFailedExperiment(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.failedExperiment; }
  get isPlayerOnly(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Treatment && (c.subtype === TreatmentSubtype.MedicalError || c.subtype === TreatmentSubtype.trickOrTreat); }
  get isBodySwap(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Treatment && c.subtype === TreatmentSubtype.BodySwap; }
  get isSelfTarget(): boolean { const c = this.selectedCard(); return c.kind === CardKind.Organ && c.color === CardColor.Orange; }

  get requiresTargetSelection(): boolean {
    const c = this.selectedCard();
    if (c.kind === CardKind.Treatment) {
      return [
        TreatmentSubtype.Transplant, TreatmentSubtype.AlienTransplant, TreatmentSubtype.OrganThief,
        TreatmentSubtype.MedicalError, TreatmentSubtype.Contagion, TreatmentSubtype.trickOrTreat,
        TreatmentSubtype.failedExperiment, TreatmentSubtype.BodySwap,
        TreatmentSubtype.colorThiefRed, TreatmentSubtype.colorThiefGreen,
        TreatmentSubtype.colorThiefBlue, TreatmentSubtype.colorThiefYellow
      ].includes(c.subtype as TreatmentSubtype);
    }
    return (c.kind === CardKind.Organ && c.color === 'orange') || c.kind === CardKind.Virus || c.kind === CardKind.Medicine;
  }

  get showSingleTarget(): boolean { return this.requiresSingleTarget && !this.isPlayerOnly; }
  private get requiresSingleTarget(): boolean { return this.requiresTargetSelection && !this.isTransplant && !this.isContagion && !this.isBodySwap; }
  get hasNoOptionsAvailable(): boolean {
    if (this.isPlayerOnly) return this.playerOptions.length === 0;
    if (this.isBodySwap) return false;
    if (this.requiresSingleTarget) return this.playerOptions.length === 0 || this.targetOptions().length === 0;
    return false;
  }

  get playerOptions(): PlayerOption[] {
    const players = new Map<string, string>();
    for (const option of this.targetOptions()) {
      if (option.playerId && option.playerName) {
          if (!players.has(option.playerId)) players.set(option.playerId, option.playerName);
      }
    }
    return Array.from(players, ([id, name]) => ({ id, name }));
  }

  handleTargetChange(value: string, which: 'A' | 'B' | 'single' = 'single') {
    if (which === 'A') this.transplantSelectionA = value;
    if (which === 'B') this.transplantSelectionB = value;
    if (which === 'single') this.singleSelectionValue = value;
    this.targetChange.emit({ value, which });
  }

  handlePlayerChange(playerId: string, which: 'A' | 'B' | 'single') {
    const handle = (selection: string) => {
        if (!playerId) { this.handleTargetChange('', which); return; }
        const organs = this.organsForPlayer(playerId);
        if (!organs.length || !organs.some((opt) => this.toOptionValue(opt) === selection)) {
             this.handleTargetChange('', which);
        }
    };

    if (which === 'single') {
        this.singlePlayerSelection = playerId;
        if (this.isPlayerOnly) { this.handleTargetChange(playerId ? `|${playerId}` : '', which); return; }
        handle(this.singleSelectionValue);
    } else if (which === 'A') {
        this.transplantPlayerA = playerId;
        handle(this.transplantSelectionA);
    } else {
        this.transplantPlayerB = playerId; 
        handle(this.transplantSelectionB);
    }
  }

  organsForPlayer(playerId: string): TargetSelectOption[] {
    if (!playerId) return [];
    return this.targetOptions().filter((o) => o.playerId === playerId && !!o.organId);
  }
  
  toOptionValue(target?: PlayCardTarget | TargetSelectOption | null): string {
    return target ? `${target.organId}|${target.playerId}` : '';
  }
}

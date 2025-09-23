import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Card,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  PlayCardTarget,
  PublicGameState,
} from '../../../../../core/models/game.model';

export interface TargetSelectOption {
  playerId: string;
  playerName: string;
  organId: string;
  organColor?: string;
}

type PlayerOption = {
  id: string;
  name: string;
};

@Component({
  selector: 'game-target-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './target-select.component.html',
  styleUrl: './target-select.component.css',
})
export class TargetSelectComponent {
  @Input({ required: true }) selectedCard!: Card;
  @Input() targetOptions: TargetSelectOption[] = [];
  @Input() contagionAssignments: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[] = [];
  @Input() publicState: PublicGameState | null = null;
  @Input() confirmDisabled: boolean = false;

  @Input()
  set selectedTarget(value: PlayCardTarget | null) {
    this.singleSelectionValue = this.toOptionValue(value);
    this.singlePlayerSelection = value?.playerId ?? '';
  }
  @Input()
  set selectedTargetA(value: PlayCardTarget | null) {
    this.transplantSelectionA = this.toOptionValue(value);
    this.transplantPlayerA = value?.playerId ?? '';
  }
  @Input()
  set selectedTargetB(value: PlayCardTarget | null) {
    this.transplantSelectionB = this.toOptionValue(value);
    this.transplantPlayerB = value?.playerId ?? '';
  }

  @Output() targetChange = new EventEmitter<{ value: string; which: 'A' | 'B' | 'single' }>();
  @Output() contagionTargetChange = new EventEmitter<{ value: string; index: number }>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly CardKind = CardKind;
  protected readonly TreatmentSubtype = TreatmentSubtype;

  singleSelectionValue = '';
  singlePlayerSelection = '';
  transplantSelectionA = '';
  transplantPlayerA = '';
  transplantSelectionB = '';
  transplantPlayerB = '';

  private readonly kindLabels: Record<CardKind, string> = {
    [CardKind.Organ]: 'Órgano',
    [CardKind.Virus]: 'Virus',
    [CardKind.Medicine]: 'Medicina',
    [CardKind.Treatment]: 'Tratamiento',
  };

  private readonly colorLabels: Record<string, string> = {
    red: 'Corazón',
    green: 'Estómago',
    blue: 'Cerebro',
    yellow: 'Hueso',
    multi: 'Multicolor',
  };

  private readonly treatmentLabels: Partial<Record<TreatmentSubtype, string>> = {
    [TreatmentSubtype.Transplant]: 'Trasplante',
    [TreatmentSubtype.OrganThief]: 'Robo de órgano',
    [TreatmentSubtype.Contagion]: 'Contagio',
    [TreatmentSubtype.Gloves]: 'Guantes de látex',
    [TreatmentSubtype.MedicalError]: 'Error médico',
  };

  get cardKindLabel(): string {
    return this.kindLabels[this.selectedCard.kind];
  }

  get cardColorLabel(): string {
    return this.colorLabels[this.selectedCard.color] ?? this.selectedCard.color;
  }

  get cardSubtypeLabel(): string | null {
    if (this.selectedCard.kind === CardKind.Treatment && this.selectedCard.subtype) {
      return this.treatmentLabels[this.selectedCard.subtype] ?? this.selectedCard.subtype;
    }
    return null;
  }

  get instruction(): string {
    if (this.isTransplant) {
      return 'Elige dos órganos distintos para completar el trasplante.';
    }
    if (this.isContagion) {
      return 'Asigna cada virus a un órgano libre de otro jugador.';
    }
    if (this.requiresTargetSelection) {
      if (this.selectedCard.kind === CardKind.Medicine) {
        return 'Selecciona el órgano que quieres curar.';
      }
      if (this.selectedCard.kind === CardKind.Virus) {
        return 'Selecciona el órgano que quieres infectar.';
      }
      if (this.selectedCard.subtype === TreatmentSubtype.OrganThief) {
        return 'Elige el órgano que vas a robar.';
      }
      if (this.selectedCard.subtype === TreatmentSubtype.MedicalError) {
        return 'Selecciona al jugador objetivo del error médico.';
      }
      return 'Selecciona el objetivo adecuado para la carta.';
    }
    return 'Confirma la jugada cuando estés listo.';
  }

  get isTransplant(): boolean {
    return (
      this.selectedCard.kind === CardKind.Treatment &&
      this.selectedCard.subtype === TreatmentSubtype.Transplant
    );
  }

  get isContagion(): boolean {
    return (
      this.selectedCard.kind === CardKind.Treatment &&
      this.selectedCard.subtype === TreatmentSubtype.Contagion
    );
  }

  get isPlayerOnly(): boolean {
    return (
      this.selectedCard.kind === CardKind.Treatment &&
      this.selectedCard.subtype === TreatmentSubtype.MedicalError
    );
  }

  get requiresTargetSelection(): boolean {
    if (this.selectedCard.kind === CardKind.Treatment) {
      return (
        this.selectedCard.subtype === TreatmentSubtype.Transplant ||
        this.selectedCard.subtype === TreatmentSubtype.OrganThief ||
        this.selectedCard.subtype === TreatmentSubtype.MedicalError ||
        this.selectedCard.subtype === TreatmentSubtype.Contagion
      );
    }
    return this.selectedCard.kind === CardKind.Virus || this.selectedCard.kind === CardKind.Medicine;
  }

  get showSingleTarget(): boolean {
    return this.requiresSingleTarget && !this.isPlayerOnly;
  }

  private get requiresSingleTarget(): boolean {
    return (
      this.requiresTargetSelection &&
      !this.isTransplant &&
      !this.isContagion
    );
  }

  get hasNoOptionsAvailable(): boolean {
    if (this.isPlayerOnly) {
      return this.playerOptions.length === 0;
    }
    if (this.requiresSingleTarget) {
      return this.playerOptions.length === 0 || this.targetOptions.length === 0;
    }
    return false;
  }

  get playerOptions(): PlayerOption[] {
    const players = new Map<string, string>();
    for (const option of this.targetOptions) {
      if (!option.playerId || !option.playerName) continue;
      if (!players.has(option.playerId)) {
        players.set(option.playerId, option.playerName);
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
    if (which === 'single') {
      this.singlePlayerSelection = playerId;
      if (this.isPlayerOnly) {
        const value = playerId ? `|${playerId}` : '';
        this.handleTargetChange(value, which);
        return;
      }

      if (!playerId) {
        this.handleTargetChange('', which);
        return;
      }

      const organs = this.organsForPlayer(playerId);
      if (!organs.length) {
        this.handleTargetChange('', which);
        return;
      }

      if (!organs.some((opt) => this.toOptionValue(opt) === this.singleSelectionValue)) {
        this.handleTargetChange('', which);
      }
    } else if (which === 'A') {
      this.transplantPlayerA = playerId;
      if (!playerId) {
        this.handleTargetChange('', which);
        return;
      }
      const organs = this.organsForPlayer(playerId);
      if (!organs.length) {
        this.handleTargetChange('', which);
        return;
      }
      if (!organs.some((opt) => this.toOptionValue(opt) === this.transplantSelectionA)) {
        this.handleTargetChange('', which);
      }
    } else {
      this.transplantPlayerB = playerId;
      if (!playerId) {
        this.handleTargetChange('', which);
        return;
      }
      const organs = this.organsForPlayer(playerId);
      if (!organs.length) {
        this.handleTargetChange('', which);
        return;
      }
      if (!organs.some((opt) => this.toOptionValue(opt) === this.transplantSelectionB)) {
        this.handleTargetChange('', which);
      }
    }
  }

  handleContagionChange(value: string, index: number) {
    this.contagionTargetChange.emit({ value, index });
  }

  selectOrgan(option: TargetSelectOption, which: 'A' | 'B' | 'single') {
    if (!option.organId) return;
    if (which === 'single') {
      this.singlePlayerSelection = option.playerId;
    } else if (which === 'A') {
      this.transplantPlayerA = option.playerId;
    } else {
      this.transplantPlayerB = option.playerId;
    }
    this.handleTargetChange(this.toOptionValue(option), which);
  }

  emitConfirm() {
    this.confirm.emit();
  }

  emitCancel() {
    this.cancel.emit();
  }

  toOptionValue(target?: PlayCardTarget | TargetSelectOption | null): string {
    if (!target) return '';
    return `${target.organId}|${target.playerId}`;
  }

  organsForPlayer(playerId: string): TargetSelectOption[] {
    if (!playerId) return [];
    return this.targetOptions.filter(
      (option) => option.playerId === playerId && !!option.organId
    );
  }

  organColorClass(color?: string): string {
    switch (color) {
      case 'red':
        return 'color-dot--red';
      case 'green':
        return 'color-dot--green';
      case 'blue':
        return 'color-dot--blue';
      case 'yellow':
        return 'color-dot--yellow';
      case 'multi':
        return 'color-dot--multi';
      default:
        return 'color-dot--neutral';
    }
  }

  organColorLabel(color?: string): string {
    if (!color) return 'Sin órgano';
    return this.colorLabels[color] ?? color;
  }

  contagionSelectionValue(assignment: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }): string {
    if (!assignment.toOrganId || !assignment.toPlayerId) return '';
    return `${assignment.toOrganId}|${assignment.toPlayerId}`;
  }

  contagionSourceLabel(assignment: { fromOrganId: string }): string {
    return `Desde órgano ${assignment.fromOrganId}`;
  }
}

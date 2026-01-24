import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  PlayCardTarget,
  PublicGameState,
  OrganOnBoard,
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
  selectedCard = input.required<Card>();
  targetOptions = input<TargetSelectOption[]>([]);
  contagionAssignments = input<{
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[]>([]);
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

  protected readonly CardKind = CardKind;
  protected readonly TreatmentSubtype = TreatmentSubtype;

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
      // Auto-select self for Mutant Organ if options available
      if (this.isSelfTarget && this.playerOptions.length >= 1 && !this.singlePlayerSelection) {
        // Always select the first option (which should be 'me' based on game-hand construction)
        this.handlePlayerChange(this.playerOptions[0].id, 'single');
      }
    });
  }

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
    orange: 'Mutante',
  };

  private readonly treatmentLabels: Partial<Record<TreatmentSubtype, string>> = {
    [TreatmentSubtype.Transplant]: 'Trasplante',
    [TreatmentSubtype.OrganThief]: 'Robo de órgano',
    [TreatmentSubtype.Contagion]: 'Contagio',
    [TreatmentSubtype.Gloves]: 'Guantes de látex',
    [TreatmentSubtype.MedicalError]: 'Error médico',
    [TreatmentSubtype.trickOrTreat]: 'Truco o Trato',
    [TreatmentSubtype.failedExperiment]: 'Experimento fallido',
    [TreatmentSubtype.colorThiefRed]: 'Ladrón Corazón',
    [TreatmentSubtype.colorThiefGreen]: 'Ladrón Estómago',
    [TreatmentSubtype.colorThiefBlue]: 'Ladrón Cerebro',
    [TreatmentSubtype.colorThiefYellow]: 'Ladrón Hueso',
    [TreatmentSubtype.BodySwap]: 'Cambio de Cuerpos',
    [TreatmentSubtype.Apparition]: 'Aparición',
    [TreatmentSubtype.AlienTransplant]: 'Trasplante Alienígena',
  };

  get cardKindLabel(): string {
    const card = this.selectedCard();
    return this.kindLabels[card.kind];
  }

  get cardColorLabel(): string {
    const card = this.selectedCard();
    return this.colorLabels[card.color] ?? card.color;
  }

  get cardSubtypeLabel(): string | null {
    const card = this.selectedCard();
    if (card.kind === CardKind.Treatment && card.subtype) {
      return this.treatmentLabels[card.subtype] ?? card.subtype;
    }
    return null;
  }

  get instruction(): string {
    if (this.isTransplant) {
      if (this.selectedCard().subtype === TreatmentSubtype.AlienTransplant) {
        return 'Elige dos órganos distintos para intercambiarlos entre jugadores sin repetir colores, incluso órganos inmunes.';
      }
      return 'Elige dos órganos distintos para intercambiarlos entre jugadores sin repetir colores.';
    }
    if (this.isContagion) {
      return 'Asigna cada virus a un órgano libre de otro jugador para propagar la infección.';
    }
    if (this.requiresTargetSelection) {
      const card = this.selectedCard();
      if (card.kind === CardKind.Medicine) {
        return 'Selecciona el órgano que quieres curar o vacunar; eliminará un virus compatible o añadirá protección.';
      }
      if (card.kind === CardKind.Virus) {
        return 'Selecciona el órgano que quieres infectar para dañarlo o extirparlo si ya está enfermo.';
      }
      if (card.subtype === TreatmentSubtype.OrganThief) {
        return 'Elige el órgano que vas a robar para añadirlo a tu cuerpo.';
      }
      if (
        card.subtype === TreatmentSubtype.colorThiefRed ||
        card.subtype === TreatmentSubtype.colorThiefGreen ||
        card.subtype === TreatmentSubtype.colorThiefBlue ||
        card.subtype === TreatmentSubtype.colorThiefYellow
      ) {
        return 'Elige el órgano de ese color que vas a robar.';
      }
      if (card.subtype === TreatmentSubtype.MedicalError) {
        return 'Selecciona al jugador con el que intercambiarás todos tus órganos.';
      }
      if (card.subtype === TreatmentSubtype.trickOrTreat) {
        return 'Elige al jugador cuyo cuerpo quedará maldito con Truco o Trato.';
      }
      if (card.subtype === TreatmentSubtype.failedExperiment) {
        return 'Elige un órgano infectado o vacunado y decide si usarla como Medicina o Virus.';
      }
      if (card.subtype === TreatmentSubtype.BodySwap) {
        return 'Elige el sentido en el que rotarán todos los cuerpos.';
      }
      if (card.color === 'orange') {
        return 'Elige cuál de tus órganos será reemplazado por el Órgano Mutante.';
      }
      return `Selecciona el objetivo para esta carta. ${this.cardEffectDescription}`;
    }
    return `${this.cardEffectDescription} Confirma para jugarla.`;
  }

  get isTransplant(): boolean {
    const card = this.selectedCard();
    return (
      card.kind === CardKind.Treatment &&
      (card.subtype === TreatmentSubtype.Transplant ||
        card.subtype === TreatmentSubtype.AlienTransplant)
    );
  }

  get isContagion(): boolean {
    const card = this.selectedCard();
    return (
      card.kind === CardKind.Treatment && card.subtype === TreatmentSubtype.Contagion
    );
  }

  get isFailedExperiment(): boolean {
    const card = this.selectedCard();
    return (
      card.kind === CardKind.Treatment &&
      card.subtype === TreatmentSubtype.failedExperiment
    );
  }

  get isPlayerOnly(): boolean {
    const card = this.selectedCard();
    return (
      card.kind === CardKind.Treatment &&
      (card.subtype === TreatmentSubtype.MedicalError ||
        card.subtype === TreatmentSubtype.trickOrTreat)
    );
  }

  get isBodySwap(): boolean {
    const card = this.selectedCard();
    return (
      card.kind === CardKind.Treatment && card.subtype === TreatmentSubtype.BodySwap
    );
  }

  get isSelfTarget(): boolean {
      const card = this.selectedCard();
      return card.kind === CardKind.Organ && card.color === CardColor.Orange;
  }

  get requiresTargetSelection(): boolean {
    const card = this.selectedCard();
    if (card.kind === CardKind.Treatment) {
      return (
        card.subtype === TreatmentSubtype.Transplant ||
        card.subtype === TreatmentSubtype.AlienTransplant ||
        card.subtype === TreatmentSubtype.OrganThief ||
        card.subtype === TreatmentSubtype.MedicalError ||
        card.subtype === TreatmentSubtype.Contagion ||
        card.subtype === TreatmentSubtype.trickOrTreat ||
        card.subtype === TreatmentSubtype.failedExperiment ||
        card.subtype === TreatmentSubtype.colorThiefRed ||
        card.subtype === TreatmentSubtype.colorThiefGreen ||
        card.subtype === TreatmentSubtype.colorThiefBlue ||
        card.subtype === TreatmentSubtype.colorThiefYellow ||
        card.subtype === TreatmentSubtype.BodySwap
      );
    }
    if (card.kind === CardKind.Organ && card.color === 'orange') {
      return true;
    }
    return card.kind === CardKind.Virus || card.kind === CardKind.Medicine;
  }

  get showSingleTarget(): boolean {
    if (this.isFailedExperiment && this.isDragDrop()) {
      return false;
    }
    return this.requiresSingleTarget && !this.isPlayerOnly;
  }

  private get requiresSingleTarget(): boolean {
    return (
      this.requiresTargetSelection &&
      !this.isTransplant &&
      !this.isContagion &&
      !this.isBodySwap
    );
  }

  get hasNoOptionsAvailable(): boolean {
    if (this.isPlayerOnly) {
      return this.playerOptions.length === 0;
    }
    if (this.isBodySwap) {
      return false; // Siempre se puede elegir sentido (excepto si solo hay 1 jugador, pero eso se maneja en backend)
    }
    if (this.requiresSingleTarget) {
      return this.playerOptions.length === 0 || this.targetOptions().length === 0;
    }
    return false;
  }

  get playerOptions(): PlayerOption[] {
    const players = new Map<string, string>();
    for (const option of this.targetOptions()) {
      if (!option.playerId || !option.playerName) continue;
      if (!players.has(option.playerId)) {
        players.set(option.playerId, option.playerName);
      }
    }
    return Array.from(players, ([id, name]) => ({ id, name }));
  }

  get contagionPlayerOptions(): PlayerOption[] {
    const state = this.publicState();
    if (!state) return [];
    const selectedPlayers = new Set(
      this.contagionAssignments()
        .map((assignment) => assignment.toPlayerId)
        .filter((id): id is string => Boolean(id))
    );
    const players: PlayerOption[] = [];
    for (const info of state.players) {
      const hasFreeOrgan = info.board.some((organ) => !organ.attached.length);
      if (hasFreeOrgan || selectedPlayers.has(info.player.id)) {
        players.push({ id: info.player.id, name: info.player.name });
      }
    }
    return players;
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

  handleContagionPlayerChange(playerId: string, index: number) {
    const value = playerId ? `|${playerId}` : '';
    this.handleContagionChange(value, index);
  }

  selectContagionOrgan(option: TargetSelectOption, index: number) {
    if (!option.organId || !option.playerId) return;
    this.handleContagionChange(this.toOptionValue(option), index);
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
    return this.targetOptions().filter(
      (option) => option.playerId === playerId && !!option.organId
    );
  }

  contagionOrgansForPlayer(playerId: string): TargetSelectOption[] {
    const state = this.publicState();
    if (!playerId || !state) return [];
    const info = state.players.find((p) => p.player.id === playerId);
    if (!info) return [];
    return info.board
      .filter((organ) => !organ.attached.length)
      .map((organ) => ({
        playerId: info.player.id,
        playerName: info.player.name,
        organId: organ.id,
        organColor: organ.color,
      }));
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
    const organInfo = this.findOrganById(assignment.fromOrganId);
    if (organInfo) {
      return `Desde ${this.organColorLabel(organInfo.organ.color)}`;
    }
    return `Desde órgano ${assignment.fromOrganId}`;
  }

  private findOrganById(organId: string): { organ: OrganOnBoard; playerName: string } | null {
    const state = this.publicState();
    if (!state) return null;
    for (const info of state.players) {
      const organ = info.board.find((o) => o.id === organId);
      if (organ) {
        return { organ, playerName: info.player.name };
      }
    }
    return null;
  }

  private get cardEffectDescription(): string {
    const card = this.selectedCard();
    switch (card.kind) {
      case CardKind.Organ:
        return 'Añade este órgano sano a tu cuerpo para acercarte a la victoria.';
      case CardKind.Virus:
        return 'Infecta un órgano compatible y podría eliminarlo si ya estaba enfermo.';
      case CardKind.Medicine:
        return 'Cura un órgano infectado o lo vacuna para protegerlo de futuros virus.';
      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Transplant:
            return 'Intercambia dos órganos entre jugadores respetando los colores disponibles.';
          case TreatmentSubtype.OrganThief:
            return 'Roba un órgano compatible de otro jugador y colócalo en tu tablero.';
          case TreatmentSubtype.Contagion:
            return 'Traslada tus virus a órganos libres de otros jugadores para infectarlos.';
          case TreatmentSubtype.Gloves:
            return 'Obliga a todos los rivales a descartar su mano, robar nuevas cartas y perder el próximo turno.';
          case TreatmentSubtype.MedicalError:
            return 'Intercambia por completo tu cuerpo con el jugador elegido.';
          case TreatmentSubtype.trickOrTreat:
            return 'Maldecirás a un jugador impidiendo su victoria hasta que cure a otro rival.';
          case TreatmentSubtype.failedExperiment:
            return 'Actúa como un virus o una medicina de cualquier color sobre un órgano infectado o vacunado.';
          case TreatmentSubtype.BodySwap:
            return 'Todos los jugadores pasan su cuerpo al jugador de al lado en el sentido elegido.';
          case TreatmentSubtype.Apparition:
            return 'Roba la carta del mazo de descartes, después puedes jugar esa carta o quedártela en la mano.';
          case TreatmentSubtype.AlienTransplant:
            return 'Intercambia dos órganos entre jugadores respetando los colores disponibles, incluso órganos inmunes.';
          default:
            return 'Aplica un efecto especial sobre la partida.';
        }
      default:
        return 'Aplica un efecto especial sobre la partida.';
    }
  }
}

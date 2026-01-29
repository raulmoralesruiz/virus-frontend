import { Component, input, output } from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [DragDropModule, CommonModule],
  templateUrl: './hand-card.html',
  styleUrl: './hand-card.css',
})
export class HandCard {
  card = input.required<Card>();
  isSelected = input(false);
  isMyTurn = input(false);
  infoOpen = input(false);
  isDisabled = input(false);
  isPlaying = input(false);

  toggleSelect = output<Card>();
  play = output<Card>();

  onToggleSelect() {
    if (!this.isMyTurn() || this.isDisabled()) return;
    this.toggleSelect.emit(this.card());
  }

  onPlay(event: MouseEvent) {
    event.stopPropagation(); // que no active toggleSelect al pulsar el botón
    this.play.emit(this.card());
  }

  get actionLabel(): string {
    if (this.isDisabled()) return '...';
    if (this.isMyTurn()) {
      return 'Jugar';
    }

    return this.infoOpen() ? 'Cancelar' : 'Info';
  }

  get icon(): string {
    const card = this.card();
    const treatmentEmoji =
      card.kind === CardKind.Treatment ? this.treatmentEmoji(card.subtype) : null;
    if (treatmentEmoji) {
      return treatmentEmoji;
    }

    switch (card.kind) {
      case CardKind.Organ:
        return this.organIcons[card.color] ?? '❔';
      case CardKind.Medicine:
        return 'assets/modifiers/medicine.svg';
      case CardKind.Virus:
        return 'assets/modifiers/virus.svg';
      case CardKind.Treatment:
        return '🧪';
      default:
        return '❔';
    }
  }

  get hasSubtype(): boolean {
    const card = this.card();
    return card.kind === CardKind.Treatment && !!card.subtype;
  }

  get formattedSubtype(): string | null {
    const card = this.card();
    if (!this.hasSubtype || !card.subtype) return null;
    const withSpaces = card.subtype.replace(/([a-z])([A-Z])/g, '$1 $2');
    return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  get subtypeImagePath(): string | null {
    const card = this.card();
    if (!this.hasSubtype || !card.subtype) return null;
    const iconFile = this.treatmentIcons[card.subtype];
    if (iconFile?.startsWith('emoji:')) {
      return null;
    }
    return iconFile ? `assets/treatment/${iconFile}` : null;
  }

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: 'assets/organs/red.svg', // ❤️
    [CardColor.Green]: 'assets/organs/green.svg', // 🫃
    [CardColor.Blue]: 'assets/organs/blue.svg', // 🧠
    [CardColor.Yellow]: 'assets/organs/yellow.svg', // 🦴
    [CardColor.Multi]: 'assets/organs/multi.svg', // 🌈
    [CardColor.Halloween]: 'assets/organs/halloween.svg', // 🎃
    [CardColor.Orange]: 'assets/organs/orange.svg', // Órgano Mutante
    [CardColor.Treatment]: '', // No usado para órganos
  };

  private readonly treatmentIcons: Record<TreatmentSubtype, string> = {
    [TreatmentSubtype.Transplant]: 'transplant.svg',
    [TreatmentSubtype.OrganThief]: 'organThief.svg',
    [TreatmentSubtype.Contagion]: 'contagion.svg',
    [TreatmentSubtype.Gloves]: 'gloves.svg',
    [TreatmentSubtype.MedicalError]: 'medicalError.svg',
    [TreatmentSubtype.failedExperiment]: 'failedExperiment.svg',
    [TreatmentSubtype.trickOrTreat]: 'trickOrTreat.svg',
    [TreatmentSubtype.colorThiefRed]: 'colorThief.svg',
    [TreatmentSubtype.colorThiefGreen]: 'colorThief.svg',
    [TreatmentSubtype.colorThiefBlue]: 'colorThief.svg',
    [TreatmentSubtype.colorThiefYellow]: 'colorThief.svg',
    [TreatmentSubtype.BodySwap]: 'bodySwap.svg',
    [TreatmentSubtype.Apparition]: 'apparition.svg',
    [TreatmentSubtype.AlienTransplant]: 'alienTransplant.svg',
  };

  private treatmentEmoji(subtype: TreatmentSubtype | undefined): string | null {
    if (!subtype) return null;
    const icon = this.treatmentIcons[subtype];
    if (icon?.startsWith('emoji:')) {
      return icon.slice('emoji:'.length);
    }
    return null;
  }

  get displayImage(): string | null {
    if (this.subtypeImagePath) {
      return this.subtypeImagePath;
    }
    const icon = this.icon;
    if (icon && icon.includes('/')) {
      return icon;
    }
    // If icon is '❔' or emojis (though not expected), we treat as no image.
    return null;
  }

  get colorThiefColor(): string | null {
    const card = this.card();
    switch (card.subtype) {
      case TreatmentSubtype.colorThiefRed:
        return 'var(--card-red-end)';
      case TreatmentSubtype.colorThiefGreen:
        return 'var(--card-green-end)';
      case TreatmentSubtype.colorThiefBlue:
        return 'var(--card-blue-end)';
      case TreatmentSubtype.colorThiefYellow:
        return 'var(--card-yellow-end)';
      default:
        return null;
    }
  }

  get cardColorClass(): string {
    const card = this.card();
    // Tratamientos de Halloween deben tener el estilo mixto (Morado/Naranja)
    if (card.kind === CardKind.Treatment && card.color === CardColor.Halloween) {
      return 'hand-card--treatment-halloween';
    }

    // Órgano mutante (Orange) debe tener el estilo de Halloween (Naranja)
    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
      return 'hand-card--halloween';
    }

    return 'hand-card--' + card.color;
  }
}

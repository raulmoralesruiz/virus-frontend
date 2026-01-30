import { Component, input, output } from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CardIconComponent } from '../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [DragDropModule, CommonModule, CardIconComponent],
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
        return 'modifier-medicine';
      case CardKind.Virus:
        return 'modifier-virus';
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

  get subtypeIconName(): string | null {
    const card = this.card();
    if (!this.hasSubtype || !card.subtype) return null;
    const iconName = this.treatmentIcons[card.subtype];
    if (iconName?.startsWith('emoji:')) {
      return null;
    }
    return iconName || null;
  }

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: 'organ-red', // ❤️
    [CardColor.Green]: 'organ-green', // 🫃
    [CardColor.Blue]: 'organ-blue', // 🧠
    [CardColor.Yellow]: 'organ-yellow', // 🦴
    [CardColor.Multi]: 'organ-multi', // 🌈
    [CardColor.Halloween]: 'organ-halloween', // 🎃
    [CardColor.Orange]: 'organ-orange', // Órgano Mutante
    [CardColor.Treatment]: '', // No usado para órganos
  };

  private readonly treatmentIcons: Record<TreatmentSubtype, string> = {
    [TreatmentSubtype.Transplant]: 'treatment-transplant',
    [TreatmentSubtype.OrganThief]: 'treatment-organThief',
    [TreatmentSubtype.Contagion]: 'treatment-contagion',
    [TreatmentSubtype.Gloves]: 'treatment-gloves',
    [TreatmentSubtype.MedicalError]: 'treatment-medicalError',
    [TreatmentSubtype.failedExperiment]: 'treatment-failedExperiment',
    [TreatmentSubtype.trickOrTreat]: 'treatment-trickOrTreat',
    [TreatmentSubtype.colorThiefRed]: 'treatment-colorThief',
    [TreatmentSubtype.colorThiefGreen]: 'treatment-colorThief',
    [TreatmentSubtype.colorThiefBlue]: 'treatment-colorThief',
    [TreatmentSubtype.colorThiefYellow]: 'treatment-colorThief',
    [TreatmentSubtype.BodySwap]: 'treatment-bodySwap',
    [TreatmentSubtype.Apparition]: 'treatment-apparition',
    [TreatmentSubtype.AlienTransplant]: 'treatment-alienTransplant',
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
    if (this.subtypeIconName) {
      return this.subtypeIconName;
    }
    const icon = this.icon;
    // Check if it's an icon name key
    if (
      icon.startsWith('organ-') || 
      icon.startsWith('modifier-') || 
      icon.startsWith('treatment-')
    ) {
      return icon;
    }
    // If icon is '❔' or emojis, we return null so no card-icon is shown 
    // (emoji handling logic not fully shown here but presumably rendered elsewhere if needed, 
    // or maybe the original logic relied on displayImage returning path OR null).
    
    // Original logic: if (icon && icon.includes('/')) return icon;
    // So if it was a path, return it. If emoji, return null.
    // My new logic covers this.
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

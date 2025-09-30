import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() card!: Card;
  @Input() isSelected: boolean = false;
  @Input() isMyTurn: boolean = false;
  @Input() infoOpen: boolean = false;

  @Output() toggleSelect = new EventEmitter<Card>();
  @Output() play = new EventEmitter<Card>();

  onToggleSelect() {
    this.toggleSelect.emit(this.card);
  }

  onPlay(event: MouseEvent) {
    event.stopPropagation(); // que no active toggleSelect al pulsar el botón
    this.play.emit(this.card);
  }

  get actionLabel(): string {
    if (this.isMyTurn) {
      return 'Jugar';
    }

    return this.infoOpen ? 'Cancelar' : 'Info';
  }

  get icon(): string {
    switch (this.card.kind) {
      case CardKind.Organ:
        return this.organIcons[this.card.color] ?? '❔';
      case CardKind.Medicine:
        return '💊';
      case CardKind.Virus:
        return '🦠';
      case CardKind.Treatment:
        return '🧪';
      default:
        return '❔';
    }
  }

  get hasSubtype(): boolean {
    return this.card.kind === CardKind.Treatment && !!this.card.subtype;
  }

  get formattedSubtype(): string | null {
    if (!this.hasSubtype || !this.card.subtype) return null;
    const withSpaces = this.card.subtype.replace(/([a-z])([A-Z])/g, '$1 $2');
    return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  get subtypeImagePath(): string | null {
    if (!this.hasSubtype || !this.card.subtype) return null;
    const iconFile = this.treatmentIcons[this.card.subtype];
    return iconFile ? `assets/treatment/${iconFile}` : null;
  }

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: '❤️',
    [CardColor.Green]: '🫃',
    [CardColor.Blue]: '🧠',
    [CardColor.Yellow]: '🦴',
    [CardColor.Multi]: '🌈',
  };

  private readonly treatmentIcons: Record<TreatmentSubtype, string> = {
    [TreatmentSubtype.Transplant]: 'transplant.svg',
    [TreatmentSubtype.OrganThief]: 'organThief.svg',
    [TreatmentSubtype.Contagion]: 'contagion.svg',
    [TreatmentSubtype.Gloves]: 'gloves.svg',
    [TreatmentSubtype.MedicalError]: 'medicalError.svg',
  };
}

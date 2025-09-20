import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
} from '../../../../../core/models/card.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [DragDropModule, TitleCasePipe, CommonModule],
  templateUrl: './hand-card.html',
  styleUrl: './hand-card.css',
})
export class HandCard {
  @Input() card!: Card;
  @Input() isSelected: boolean = false;
  @Input() isMyTurn: boolean = false;

  @Output() toggleSelect = new EventEmitter<Card>();
  @Output() play = new EventEmitter<Card>();

  onToggleSelect() {
    this.toggleSelect.emit(this.card);
  }

  onPlay(event: MouseEvent) {
    event.stopPropagation(); // que no active toggleSelect al pulsar el botón
    this.play.emit(this.card);
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
    return this.card.subtype.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: '❤️',
    [CardColor.Green]: '🫃',
    [CardColor.Blue]: '🧠',
    [CardColor.Yellow]: '🦴',
    [CardColor.Multi]: '🌈',
  };
}


import { Component, input, output, effect, inject } from '@angular/core';
import { Card, CardKind, CardColor } from '../../../../../core/models/card.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { DragDropService } from '../../../../../core/services/drag-drop.service';
import { HandCardContentComponent } from './hand-card-content/hand-card-content.component';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [DragDropModule, CommonModule, HandCardContentComponent],
  templateUrl: './hand-card.html',
  styleUrls: ['./hand-card.css', './hand-card-colors.css'],
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

  private dragDropService = inject(DragDropService);

  constructor() {
    effect(() => {
      const disabled = this.isDisabled();
      const dragging = this.dragDropService.draggedItem();
      const currentCard = this.card();

      if (disabled && dragging && dragging.id === currentCard.id) {
         this.dragDropService.draggedItem.set(null);
      }
    });
  }

  onToggleSelect() {
    if (!this.isMyTurn() || this.isDisabled()) return;
    this.toggleSelect.emit(this.card());
  }

  onPlay(event: MouseEvent) {
    event.stopPropagation();
    this.play.emit(this.card());
  }

  onDragStarted() {
    this.dragDropService.draggedItem.set(this.card());
  }

  onDragEnded() {
    this.dragDropService.draggedItem.set(null);
  }

  get actionLabel(): string {
    if (this.isDisabled()) return '...';
    if (this.isMyTurn()) {
      return 'Jugar';
    }

    return this.infoOpen() ? 'Cancelar' : 'Info';
  }

  get cardColorClass(): string {
    const card = this.card();
    if (card.kind === CardKind.Treatment && card.color === CardColor.Halloween) {
      return 'hand-card--treatment-halloween';
    }

    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
      return 'hand-card--halloween';
    }

    return 'hand-card--' + card.color;
  }

  ngOnDestroy() {
    const dragging = this.dragDropService.draggedItem();
    const currentCard = this.card();
    
    if (dragging && dragging.id === currentCard.id) {
      this.dragDropService.draggedItem.set(null);
    }
  }
}

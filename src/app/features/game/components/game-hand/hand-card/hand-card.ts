
import { Component, input, output, effect, inject, computed } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Card, CardKind, CardColor } from '../../../../../core/models/card.model';
import { DragDropService } from '../../../../../core/services/drag-drop.service';
import { HandCardContentComponent } from './hand-card-content/hand-card-content.component';
import { HandCardButtonComponent } from './button/hand-card-button.component';

@Component({
  selector: 'app-hand-card',
  standalone: true,
  imports: [DragDropModule, CommonModule, HandCardContentComponent, HandCardButtonComponent],
  templateUrl: './hand-card.html',
  styleUrls: ['./hand-card.css', './styles/hand-card-colors.css'],
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

  private ddService = inject(DragDropService);

  constructor() {
    effect(() => {
      const { id } = this.card();
      if (this.isDisabled() && this.ddService.draggedItem()?.id === id) {
         this.ddService.draggedItem.set(null);
      }
    });
  }

  containerClasses = computed(() => {
    const c = this.card();
    const isHalloween = c.color === CardColor.Halloween;
    const colorClass = (c.kind === CardKind.Treatment && isHalloween) ? 'hand-card--treatment-halloween' :
                       (c.kind === CardKind.Organ && c.color === CardColor.Orange) ? 'hand-card--halloween' :
                       `hand-card--${c.color}`;
    
    return [
      colorClass, `hand-card--${c.kind}`,
      this.isSelected() ? 'is-selected' : '',
      this.isMyTurn() ? 'is-my-turn' : '',
      this.isDisabled() ? 'disabled' : '',
      this.isPlaying() ? 'is-playing' : ''
    ];
  });

  actionLabel = computed(() => 
    this.isDisabled() ? '...' : 
    this.isMyTurn() ? 'Jugar' : 
    this.infoOpen() ? 'Cancelar' : 'Info'
  );

  onToggleSelect() {
    if (this.isMyTurn() && !this.isDisabled()) this.toggleSelect.emit(this.card());
  }

  onPlay() {
    this.play.emit(this.card());
  }

  onDragStarted() {
    this.ddService.draggedItem.set(this.card());
  }

  onDragEnded() {
    this.ddService.draggedItem.set(null);
  }

  ngOnDestroy() {
    if (this.ddService.draggedItem()?.id === this.card().id) {
      this.ddService.draggedItem.set(null);
    }
  }
}

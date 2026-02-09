import { Component, computed, inject, input, output, signal, effect } from '@angular/core';
import { DragDropService } from '@core/services/drag-drop.service';
import { OrganOnBoard } from '@core/models/game.model';
import { Card } from '@core/models/card.model';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { PlayerCardIconComponent } from './components/player-card-icon/player-card-icon.component';
import { PlayerCardAttachmentsComponent } from './components/player-card-attachments/player-card-attachments.component';
import { isValidDropTarget } from './player-card.validator';

@Component({
  selector: 'player-card',
  standalone: true,
  imports: [DragDropModule, PlayerCardIconComponent, PlayerCardAttachmentsComponent],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCardComponent {
  organ = input.required<OrganOnBoard>();
  isMe = input(false);
  contagionMode = input(false);
  temporaryViruses = input<Card[]>([]);

  dropListId = input.required<string>();
  dropListData = input<unknown>(null);
  dropListConnectedTo = input<(string | CdkDropList<unknown>)[]>([]);
  dropListEnterPredicate = input<
    ((drag: CdkDrag<unknown>, drop: CdkDropList<unknown>) => boolean) | undefined
  >(undefined);
  dropListDisabled = input(false);

  dropListDropped = output<CdkDragDrop<unknown>>();
  dropListEntered = output<CdkDragEnter<unknown>>();
  defaultEnterPredicate = (_drag: CdkDrag<unknown>, _drop: CdkDropList<unknown>) => true;

  // Método para obtener todos los virus (reales + temporales)
  getAllAttachedCards = computed(() => {
    const organ = this.organ();
    const realCards = organ.attached || [];
    const tempCards = this.temporaryViruses() || [];
    return [...realCards, ...tempCards];
  });

  private dragDropService = inject(DragDropService);

  onVirusDragStarted(virus: Card) {
    this.dragDropService.draggedItem.set({ 
      fromOrganId: this.organ().id, 
      virusId: virus.id, 
      virus, 
      kind: 'virus-token' 
    });
  }

  onVirusDragEnded() {
    this.dragDropService.draggedItem.set(null);
  }

  isValidTarget = computed(() => {
    return isValidDropTarget(this.dragDropService.draggedItem(), this.organ(), this.isMe());
  });

  // Drag over state for visual feedback
  isDragOver = computed(() => {
    if (!this.isValidTarget()) return false;
    return this._isDragOver();
  });
  private _isDragOver = signal(false);

  constructor() {
    effect(() => {
      if (!this.dragDropService.draggedItem()) {
        this._isDragOver.set(false);
      }
    });
  }

  onDragEntered() {
    if (this.isValidTarget()) {
      this._isDragOver.set(true);
    }
  }

  onDragExited() {
    this._isDragOver.set(false);
  }

  onDropped() {
    this._isDragOver.set(false);
  }
}

import { Component, input, output } from '@angular/core';
import { Card, CardKind } from '../../../../../../../../core/models/card.model';
import { CardIconComponent } from '../../../../../../../../shared/components/card-icon/card-icon.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { OrganOnBoard } from '../../../../../../../../core/models/game.model';

@Component({
  selector: 'player-card-attachments',
  standalone: true,
  imports: [CardIconComponent, CdkDrag],
  templateUrl: './player-card-attachments.component.html',
  styleUrl: './player-card-attachments.component.css',
})
export class PlayerCardAttachmentsComponent {
  organ = input.required<OrganOnBoard>();
  attachedCards = input.required<Card[]>();
  contagionMode = input(false);
  temporaryViruses = input<Card[]>([]);

  onDragStarted = output<Card>();
  onDragEnded = output<void>();

  isVirus(attached: Card) {
    return attached.kind === CardKind.Virus;
  }

  isTemporaryVirus(virusId: string): boolean {
    return this.temporaryViruses().some((tv) => tv.id === virusId);
  }

  getMedicineIcon(): string {
    return 'modifier-medicine';
  }

  getVirusIcon(): string {
    return 'modifier-virus';
  }
}

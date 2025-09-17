import { Component, Input } from '@angular/core';
import { OrganOnBoard } from '../../../../../../core/models/game.model';
import { TitleCasePipe } from '@angular/common';
import { Card, CardKind } from '../../../../../../core/models/card.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'player-card',
  standalone: true,
  imports: [TitleCasePipe, DragDropModule],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCardComponent {
  @Input() organ!: OrganOnBoard;
  @Input() contagionMode: boolean = false;
  @Input() temporaryViruses: Card[] = [];

  // Agregar input para el estado de contagio completo
  @Input() contagionState: {
    card: Card;
    assignments: any[];
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null = null;

  // Método para obtener todos los virus (reales + temporales)
  getAllAttachedCards(): Card[] {
    const realCards = this.organ.attached || [];
    const tempCards = this.temporaryViruses || [];

    return [...realCards, ...tempCards];
  }

  isVirus(attached: Card) {
    return attached.kind === CardKind.Virus;
  }

  isTemporaryVirus(virusId: string): boolean {
    return this.temporaryViruses.some((tv) => tv.id === virusId);
  }
}

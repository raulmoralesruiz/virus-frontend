import { Component, input, output } from '@angular/core';
import { OrganOnBoard } from '../../../../../../core/models/game.model';
import { Card, CardKind, CardColor } from '../../../../../../core/models/card.model';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'player-card',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCardComponent {
  organ = input.required<OrganOnBoard>();
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

  // Agregar input para el estado de contagio completo
  contagionState = input<{
    card: Card;
    assignments: any[];
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null>(null);

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: '❤️',
    [CardColor.Green]: '🫃',
    [CardColor.Blue]: '🧠',
    [CardColor.Yellow]: '🦴',
    [CardColor.Multi]: '🌈',
  };

  // Método para obtener todos los virus (reales + temporales)
  getAllAttachedCards(): Card[] {
    const organ = this.organ();
    const realCards = organ.attached || [];
    const tempCards = this.temporaryViruses() || [];

    return [...realCards, ...tempCards];
  }

  isVirus(attached: Card) {
    return attached.kind === CardKind.Virus;
  }

  isTemporaryVirus(virusId: string): boolean {
    return this.temporaryViruses().some((tv) => tv.id === virusId);
  }

  organIcon(): string {
    return this.organIcons[this.organ().color] ?? '❔';
  }
}

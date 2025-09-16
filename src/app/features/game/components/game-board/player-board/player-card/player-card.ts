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

  isVirus(attached: Card) {
    return attached.kind === CardKind.Virus;
  }
}

import { Component, input } from '@angular/core';
import { CardIconComponent } from '../../../../../../../../shared/components/card-icon/card-icon.component';
import { OrganOnBoard } from '../../../../../../../../core/models/game.model';
import { CardColor } from '../../../../../../../../core/models/card.model';

@Component({
  selector: 'player-card-icon',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './player-card-icon.component.html',
  styleUrl: './player-card-icon.component.css',
})
export class PlayerCardIconComponent {
  organ = input.required<OrganOnBoard>();

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: 'organ-red',
    [CardColor.Green]: 'organ-green',
    [CardColor.Blue]: 'organ-blue',
    [CardColor.Yellow]: 'organ-yellow',
    [CardColor.Multi]: 'organ-multi',
    [CardColor.Halloween]: 'organ-halloween',
    [CardColor.Orange]: 'organ-orange',
    [CardColor.Treatment]: '',
  };

  organIcon(): string {
    return this.organIcons[this.organ().color] ?? '❔';
  }
}

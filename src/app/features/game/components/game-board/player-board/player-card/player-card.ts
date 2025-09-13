import { Component, Input } from '@angular/core';
import { OrganOnBoard } from '../../../../../../core/models/game.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'player-card',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCardComponent {
  @Input() organ!: OrganOnBoard;
}

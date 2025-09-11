import { Component, Input } from '@angular/core';
import { PlayerCard } from './player-card/player-card';
import { TitleCasePipe } from '@angular/common';
import { CardColor } from '../../../../../core/models/card.model';
import { PublicPlayerInfo } from '../../../../../core/models/game.model';

@Component({
  selector: 'app-player-board',
  standalone: true,
  imports: [PlayerCard, TitleCasePipe],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
})
export class PlayerBoard {
  @Input() player!: PublicPlayerInfo;
  @Input() isMe: boolean = false;
  @Input() isActive: boolean = false;

  cardColors = Object.values(CardColor);

  getOrganByColor(color: CardColor) {
    return this.player.board.find((o) => o.color === color);
  }
}

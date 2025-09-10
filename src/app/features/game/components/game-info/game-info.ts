import { Component, Input } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'game-info',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './game-info.html',
  styleUrl: './game-info.css',
})
export class GameInfoComponent {
  @Input() state!: PublicGameState;
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicPlayerInfo } from '../../../../core/models/game.model';

@Component({
  selector: 'game-winner',
  standalone: true,
  imports: [],
  templateUrl: './game-winner.html',
  styleUrl: './game-winner.css',
})
export class GameWinnerComponent {
  @Input() winner!: { player: PublicPlayerInfo['player'] };
  @Output() reset = new EventEmitter<void>();

  onReset() {
    this.reset.emit();
  }
}

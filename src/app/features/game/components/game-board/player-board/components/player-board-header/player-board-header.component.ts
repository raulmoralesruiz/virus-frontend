import { Component, computed, input } from '@angular/core';
import { PublicPlayerInfo } from '../../../../../../../core/models/game.model';
import { CardIconComponent } from '../../../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'player-board-header',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './player-board-header.component.html',
  styleUrl: './player-board-header.component.css'
})
export class PlayerBoardHeaderComponent {
  player = input.required<PublicPlayerInfo>();
  isActive = input(false);
  isMe = input(false);
  remainingSeconds = input(0);
  turnDurationSeconds = input(0);
  turnTimerState = input<'idle' | 'running' | 'warning' | 'critical'>('idle');
  turnProgressPercent = input(0);
}

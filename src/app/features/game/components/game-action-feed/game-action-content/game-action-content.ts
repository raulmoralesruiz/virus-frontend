import { Component, input, output } from '@angular/core';
import { GameAction } from '../types/game-action.types';
import { GameActionIdentityComponent } from './identity/game-action-identity.component';
import { GameActionMessageComponent } from './message/game-action-message.component';

@Component({
  selector: 'game-action-content',
  standalone: true,
  imports: [GameActionIdentityComponent, GameActionMessageComponent],
  templateUrl: './game-action-content.html',
  styleUrl: './game-action-content.css',
})
export class GameActionContentComponent {
  action = input<GameAction | null>(null);
  dismiss = output<void>();

  onDismiss() {
    this.dismiss.emit();
  }
}

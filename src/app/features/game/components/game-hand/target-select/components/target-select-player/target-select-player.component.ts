import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerOption } from '../../target-select.models';

@Component({
  selector: 'game-target-select-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './target-select-player.component.html',
  styleUrls: ['./target-select-player.component.css']
})
export class TargetSelectPlayerComponent {
  playerOptions = input.required<PlayerOption[]>();
  singlePlayerSelection = input<string>('');
  
  playerChange = output<string>();
  
  handlePlayerChange(playerId: string) {
    this.playerChange.emit(playerId);
  }
}

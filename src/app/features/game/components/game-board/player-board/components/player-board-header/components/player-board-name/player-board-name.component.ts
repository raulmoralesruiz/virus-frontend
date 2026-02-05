import { Component, input } from '@angular/core';

@Component({
  selector: 'player-board-name',
  standalone: true,
  templateUrl: './player-board-name.component.html',
  styleUrl: './player-board-name.component.css',
})
export class PlayerBoardNameComponent {
  name = input.required<string>();
}

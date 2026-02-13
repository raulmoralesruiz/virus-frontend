import { Component, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'player-board-name',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './player-board-name.component.html',
  styleUrl: './player-board-name.component.css',
})
export class PlayerBoardNameComponent {
  name = input.required<string>();
}

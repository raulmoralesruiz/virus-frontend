import { Component, input } from '@angular/core';

@Component({
  selector: 'game-info-title',
  standalone: true,
  imports: [],
  templateUrl: './game-info-title.html',
  styleUrl: './game-info-title.css',
})
export class GameInfoTitleComponent {
  roomId = input.required<string>();
  showDetails = input(false);
}

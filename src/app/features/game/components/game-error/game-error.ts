import { Component, Input } from '@angular/core';

@Component({
  selector: 'game-error',
  standalone: true,
  imports: [],
  templateUrl: './game-error.html',
  styleUrl: './game-error.css',
})
export class GameErrorComponent {
  @Input() error: string | null = null;
}

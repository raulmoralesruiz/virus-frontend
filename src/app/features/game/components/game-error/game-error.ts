import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-error',
  standalone: true,
  imports: [],
  templateUrl: './game-error.html',
  styleUrl: './game-error.css',
})
export class GameErrorComponent {
  error = input<string | null>(null);

  closed = output<void>();

  onOverlayClick() {
    this.closed.emit();
  }

  onCloseClick(event: MouseEvent) {
    event.stopPropagation();
    this.closed.emit();
  }
}

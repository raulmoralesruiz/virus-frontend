import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'game-error',
  standalone: true,
  imports: [],
  templateUrl: './game-error.html',
  styleUrl: './game-error.css',
})
export class GameErrorComponent {
  @Input() error: string | null = null;

  @Output() closed = new EventEmitter<void>();

  onOverlayClick() {
    this.closed.emit();
  }

  onCloseClick(event: MouseEvent) {
    event.stopPropagation();
    this.closed.emit();
  }
}

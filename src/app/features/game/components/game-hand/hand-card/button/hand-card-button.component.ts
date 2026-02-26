
import { Component, input, output } from '@angular/core';


@Component({
  selector: 'app-hand-card-button',
  standalone: true,
  imports: [],
  templateUrl: './hand-card-button.component.html',
  styleUrl: './hand-card-button.component.css',
})
export class HandCardButtonComponent {
  label = input.required<string>();
  disabled = input(false);
  action = output<MouseEvent>();

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.action.emit(event);
  }
}

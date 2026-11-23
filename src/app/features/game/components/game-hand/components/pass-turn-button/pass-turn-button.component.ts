import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-pass-turn-button',
  standalone: true,
  templateUrl: './pass-turn-button.component.html',
  styleUrl: './pass-turn-button.component.css',
})
export class PassTurnButtonComponent {
  isDisabled = input(false);
  /** Verbo visible. Por defecto «Pasar turno»; el host puede poner el motivo del bloqueo. */
  label = input('Pasar turno');
  pass = output<void>();
}

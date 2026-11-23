import { Component } from '@angular/core';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';

@Component({
  selector: 'game-help',
  standalone: true,
  imports: [FocusTrapDirective],
  templateUrl: './game-help.component.html',
  styleUrl: './game-help.component.css',
})
export class GameHelpComponent {
  /** Guía completa (virus-docs) para quienes quieran el reglamento entero. */
  readonly rulesUrl = 'https://virusdocs.raulmorales.eu/guides/game-mechanics/';

  open = false;

  openHelp(): void {
    this.open = true;
  }

  closeHelp(): void {
    this.open = false;
  }
}

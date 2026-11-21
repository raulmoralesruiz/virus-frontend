import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-apparition-banner',
  standalone: true,
  templateUrl: './apparition-banner.component.html',
  styleUrl: './apparition-banner.component.css',
})
export class ApparitionBannerComponent {
  keep = output<void>();
  /** true mientras la conexión no está establecida (deshabilita la acción). */
  disabled = input(false);
}

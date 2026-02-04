import { Component, output } from '@angular/core';

@Component({
  selector: 'game-apparition-banner',
  standalone: true,
  templateUrl: './apparition-banner.component.html',
  styleUrl: './apparition-banner.component.css',
})
export class ApparitionBannerComponent {
  keep = output<void>();
}

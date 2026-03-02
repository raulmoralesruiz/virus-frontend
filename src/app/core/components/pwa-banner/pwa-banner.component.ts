import { Component, computed, inject } from '@angular/core';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-banner',
  standalone: true,
  templateUrl: './pwa-banner.component.html',
  styleUrl: './pwa-banner.component.css',
})
export class PwaBannerComponent {
  protected readonly pwaService = inject(PwaService);
}

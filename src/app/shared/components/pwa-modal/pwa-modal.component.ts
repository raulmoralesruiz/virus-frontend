import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-modal',
  standalone: true,
  templateUrl: './pwa-modal.component.html',
  styleUrl: './pwa-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaModalComponent {
  protected readonly pwaService = inject(PwaService);
  protected readonly isModalOpen = signal<boolean>(false);

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  updateApp(): void {
    this.pwaService.updateNow();
    this.closeModal();
  }

  installApp(): void {
    this.pwaService.promptInstall();
    this.closeModal();
  }
}

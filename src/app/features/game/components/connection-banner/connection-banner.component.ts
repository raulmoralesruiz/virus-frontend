import { Component, computed, inject } from '@angular/core';
import { SocketService } from '@core/services/socket/socket.service';

/**
 * Aviso fijo superior mientras la conexión no está estable.
 * El contenedor vive siempre en el DOM (region aria-live) y el texto se
 * inserta al caer la conexión, para que los lectores de pantalla lo anuncien.
 */
@Component({
  selector: 'game-connection-banner',
  standalone: true,
  template: `
    <div class="connection-banner" role="status" aria-live="assertive" [class.is-visible]="!connected()">
      <span class="connection-banner__content" [hidden]="connected()">
        <span class="connection-banner__icon" aria-hidden="true">⚠️</span>
        <span class="connection-banner__text">{{ text() }}</span>
      </span>
    </div>
  `,
  styleUrl: './connection-banner.css',
})
export class ConnectionBannerComponent {
  private readonly socketService = inject(SocketService);

  readonly connected = computed(() => this.socketService.connectionStatus() === 'online');

  readonly text = computed(() => {
    const status = this.socketService.connectionStatus();
    return status === 'reconnecting'
      ? 'Reconectando… Las acciones están temporalmente desactivadas.'
      : 'Sin conexión. Reintentando… Las acciones están temporalmente desactivadas.';
  });
}

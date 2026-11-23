import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';
import { SocketService } from '@core/services/socket/socket.service';
import { ThemeToggleComponent } from '../../../../components/theme-toggle/theme-toggle.component';

/** Tiempo máximo esperando la partida antes de ofrecer reintento. */
const LOADING_TIMEOUT_MS = 30000;

@Component({
  selector: 'game-loading',
  standalone: true,
  imports: [ThemeToggleComponent],
  templateUrl: './game-loading.component.html',
  styleUrls: ['./game-loading.component.css']
})
export class GameLoadingComponent implements OnInit, OnDestroy {
  private gameStore = inject(GameStoreService);
  private socket = inject(SocketService);

  /** true cuando la carga supera el umbral y mostramos el estado de error. */
  protected readonly timedOut = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.armTimeout();
  }

  ngOnDestroy() {
    this.disarmTimeout();
  }

  /** Vuelve a pedirle al servidor el estado de la partida y reinicia el umbral. */
  retry() {
    this.socket.restorePlayerSession();
    this.armTimeout();
  }

  goHome() {
    this.gameStore.goHome();
  }

  private armTimeout() {
    this.disarmTimeout();
    this.timedOut.set(false);
    this.timer = setTimeout(() => this.timedOut.set(true), LOADING_TIMEOUT_MS);
  }

  private disarmTimeout() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

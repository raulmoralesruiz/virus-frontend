import { Injectable, computed, signal, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { PLAYER_CONSTANTS } from '../../constants/player.constants';

export type ConnectionStatus = 'offline' | 'reconnecting' | 'online';

/** Frecuencia del liveness probe (ms). */
export const PING_INTERVAL_MS = 5000;
/** Tiempo máximo para recibir el ack del probe (ms). */
export const PING_TIMEOUT_MS = 3000;

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket?: Socket;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private probeInFlight = false;

  /** Estado de la conexión en tiempo real (p. ej. para banners y deshabilitar acciones). */
  readonly connectionStatus = signal<ConnectionStatus>('offline');

  /** true solo mientras la conexión está establecida. */
  readonly connected = computed(() => this.connectionStatus() === 'online');

  /** El navegador avisa de la caída de red antes de que el transporte lo note. */
  private readonly offlineListener = () => {
    this.connectionStatus.set('offline');
  };

  /**
   * Al recuperar red: si el socket seguía "conectado" (zombi que volvió a
   * vida), socket.io no disparará 'connect' otra vez, así que restauramos el
   * estado aquí. Si el socket está caído, los reintentos de socket.io
   * dispararán 'connect' y el handler existente se encargará.
   */
  private readonly onlineListener = () => {
    if (this.socket?.connected && this.connectionStatus() !== 'online') {
      this.connectionStatus.set('online');
      this.startLivenessProbe();
      this.tryRestorePlayerSession();
    }
  };

  constructor() {
    this.connect();
    window.addEventListener('offline', this.offlineListener);
    window.addEventListener('online', this.onlineListener);
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      this.connectionStatus.set('online');
      this.tryRestorePlayerSession();
      this.startLivenessProbe();
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus.set('offline');
      this.probeInFlight = false;
      this.stopLivenessProbe();
    });

    // socket.io reintenta en segundo plano; avisamos mientras lo hace.
    this.socket.on('reconnect_attempt', () => {
      if (this.connectionStatus() === 'offline') {
        this.connectionStatus.set('reconnecting');
      }
    });
  }

  /**
   * socket.io v4 no tiene temporizador de vida en el cliente: una conexión
   * "zombi" (la red cayó pero el TCP no se ha cerrado) sigue reportando
   * connected=true y los emits se pierden sin aviso. Sondeamos con ping/ack
   * y, si el ack no llega a tiempo, forzamos un ciclo completo de
   * desconexión/conexión (dispara 'disconnect' → banner; y 'connect' si la
   * red está viva, recuperando la sesión).
   */
  private startLivenessProbe() {
    if (this.pingTimer !== null) return;
    this.pingTimer = setInterval(() => this.runLivenessProbe(), PING_INTERVAL_MS);
  }

  private stopLivenessProbe() {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private runLivenessProbe() {
    if (this.probeInFlight || !this.socket) return;
    if (this.connectionStatus() !== 'online') return;
    this.probeInFlight = true;
    this.socket
      .timeout(PING_TIMEOUT_MS)
      .emit(PLAYER_CONSTANTS.CLIENT_PING, (err?: Error) => {
        this.probeInFlight = false;
        if (err) {
          console.warn('Liveness probe expiró; forzando reconexión.');
          this.forceReconnect();
        }
      });
  }

  private forceReconnect() {
    // El probe que expiró ya no tiene sentido; no lo dejemos "in flight".
    this.probeInFlight = false;
    this.socket?.disconnect();
    this.socket?.connect();
  }

  ngOnDestroy() {
    this.stopLivenessProbe();
    window.removeEventListener('offline', this.offlineListener);
    window.removeEventListener('online', this.onlineListener);
    this.disconnect();
  }

  private tryRestorePlayerSession() {
    try {
      const raw = localStorage.getItem('player');
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p?.id) {
        this.emit(PLAYER_CONSTANTS.PLAYER_RECONNECT, { playerId: p.id });
      }
    } catch {
      console.warn('Failed to restore player session:');
    }
  }

  /**
   * Re-sincroniza la sesión del jugador con el servidor (re-emit
   * PLAYER_RECONNECT). Si la conexión está caída, socket.io reintenta en
   * segundo plano y el 'connect' restaurará la sesión automáticamente.
   */
  restorePlayerSession() {
    this.tryRestorePlayerSession();
  }

  emit(event: string, data?: any) {
    if (!this.socket) {
      console.warn(`Socket not connected. Event "${event}" not sent.`);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.warn(`Socket not connected. Cannot listen to "${event}".`);
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

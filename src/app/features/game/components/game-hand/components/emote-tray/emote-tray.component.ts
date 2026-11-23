import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { EMOTES } from '@core/constants/emote.constants';
import { GameStoreService } from '@core/services/game-store.service';

/** Contador de instancias: garantiza ids únicos si coexisten varios trays en el DOM. */
let panelIdCounter = 0;

/**
 * Bandeja de reacciones sociales, colapsable.
 *
 * - Arranca colapsada: un solo trigger «Reaccionar» con `aria-expanded`.
 * - Expandido muestra el panel con los 6 emotes (`role="toolbar"`).
 * - Cierra al enviar un emote (autoclose), con Escape o con clic fuera.
 * - Al cerrar devuelve el foco al trigger si el foco estaba dentro de la bandeja.
 * - El envío de emotes no depende del turno (comportamiento sin cambios).
 * - El estado es solo en memoria (sin `localStorage`).
 */
@Component({
  selector: 'game-emote-tray',
  standalone: true,
  templateUrl: './emote-tray.component.html',
  styleUrl: './emote-tray.component.css',
})
export class EmoteTrayComponent {
  readonly emotes = EMOTES;
  roomId = input<string | null>(null);

  /** Id único del panel: pueden coexistir dos instancias (mano + modal de ganador). */
  readonly panelId = `emote-tray-panel-${panelIdCounter++}`;

  /** Colapsada por defecto; se expande a demanda (solo en memoria). */
  readonly open = signal(false);

  private readonly gameStore = inject(GameStoreService);
  private readonly el = inject(ElementRef<HTMLElement>);

  toggle(): void {
    this.open.update((v) => !v);
  }

  send(emote: string): void {
    const roomId = this.roomId();
    if (roomId) {
      this.gameStore.sendEmote(roomId, emote);
    }
    this.close(); // autoclose: la reacción se envía y el panel se pliega
  }

  close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.restoreFocus();
  }

  /**
   * Escape solo lo gestiona cuando el panel está abierto, y se lo traga para
   * que no se filtre al host padre (p. ej. la focus trap del modal de ganador).
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) {
      return;
    }
    event.stopPropagation();
    this.close();
  }

  /** Clic fuera de la bandeja: pliega el panel (solo si está abierto). */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const target = event.target;
    if (target instanceof Node && this.el.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }

  /** Si el foco estaba dentro de la bandeja, vuelve al trigger. */
  private restoreFocus(): void {
    const host = this.el.nativeElement;
    const active = document.activeElement;
    if (!(active instanceof Node) || !host.contains(active)) {
      return;
    }
    const trigger = host.querySelector('.emote-tray__trigger');
    if (trigger instanceof HTMLButtonElement) {
      trigger.focus();
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { Card } from '../models/card.model';

/**
 * Animación de salida de la mano (jugar/descartar).
 *
 * La respuesta del servidor retira las cartas de `hand` casi al instante,
 * así que una clase sobre el nodo original cortaría la animación a medias.
 * Este servicio guarda una "foto de layout" (la mano completa en el momento
 * de la acción) y la mano la renderiza durante unos cientos de ms: las cartas
 * salidas aparecen como ghost inerte animando la salida, y al terminar el
 * temporal la mano viva retoma el control (las restantes se asientan).
 */
@Injectable({ providedIn: 'root' })
export class HandMotionService {
  /** Foto de layout activa (null = renderizar la mano viva). */
  readonly layout = signal<Card[] | null>(null);
  /** Ids de cartas que están saliendo (se renderizan como ghost). */
  readonly leavingIds = signal<Set<string>>(new Set());

  /** Debe cubrir la animación handGhostLeave (350 ms) con un pequeño margen. */
  static readonly LEAVE_MS = 450;

  private _timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Marca cartas como salientes.
   * @param hand        mano viva completa en el momento de la acción (referencia de layout)
   * @param leavingIds  ids del subconjunto que acaba de salir
   */
  markLeaving(hand: Card[], leavingIds: string[]) {
    const ids = leavingIds.filter((id) => !!id);
    if (!hand.length || !ids.length) return;

    this.layout.set([...hand]);
    this.leavingIds.update((current) => {
      const next = new Set(current);
      for (const id of ids) next.add(id);
      return next;
    });

    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => this.reset(), HandMotionService.LEAVE_MS);
  }

  /** Libera la foto de layout y las marcas de salida (auto-cleanup o manual). */
  reset() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this.layout.set(null);
    this.leavingIds.set(new Set());
  }
}

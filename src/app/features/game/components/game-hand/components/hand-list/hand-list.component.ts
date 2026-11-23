import { Component, computed, inject, input, output } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HandCard } from '../../hand-card/hand-card';
import { HandCardContentComponent } from '../../hand-card/hand-card-content/hand-card-content.component';
import { Card, CardColor, CardKind } from '@core/models/card.model';
import { HandMotionService } from '@core/services/hand-motion.service';

@Component({
  selector: 'game-hand-list',
  standalone: true,
  imports: [DragDropModule, HandCard, HandCardContentComponent],
  templateUrl: './hand-list.component.html',
  styleUrl: './hand-list.component.css',
})
export class HandListComponent {
  private _motion = inject(HandMotionService);

  hand = input.required<Card[]>();

  isMyTurn = input(false);
  playerId = input<string | undefined>(undefined);
  connectedTo = input<string[]>([]);
  selectedIndices = input<Set<number>>(new Set());
  selectedPlayingCardId = input<string | null | undefined>(undefined);
  mustPlayCardId = input<string | null>(null);
  /** true mientras la conexión no está establecida: deshabilita botones y drag. */
  offline = input(false);
  /** true mientras hay una carta en curso de objetivo: el resto de la mano queda inerte. */
  isTargeting = input(false);

  exitHand = output<any>();
  toggleSelect = output<number>();
  play = output<Card>();

  // ── Reparto escalonado ─────────────────────────────────────────────────
  // Si varias cartas nuevas llegan a la vez (inicio de partida), la animación
  // de entrada se escala 70 ms por carta. Un robo individual (1 carta nueva)
  // entra sin retraso, con la animación base. La detección de "nuevas" se
  // hace al evaluar renderHand: solo se toca estado plano (sin effect ni
  // temporales) y la lectura de `hand` (input.required) ocurre siempre desde
  // la plantilla, cuando el input ya está fijado.
  private static readonly STAGGER_STEP_MS = 70;
  private _prevIds = new Set<string>();
  private _stagger = new Map<string, number>();

  /**
   * Lista que se renderiza: la foto de layout mientras una carta sale (para
   * que el ghost termine su animación aunque la mano viva ya la haya perdido),
   * o la mano viva en el resto del tiempo.
   */
  readonly renderHand = computed(() => {
    const list = this._motion.layout() ?? this.hand();
    const prev = this._prevIds;
    this._prevIds = new Set(list.map((c) => c.id));

    const fresh = list.filter((c) => !prev.has(c.id));
    if (fresh.length > 1) {
      const delays = new Map<string, number>();
      fresh.forEach((c, i) => delays.set(c.id, i * HandListComponent.STAGGER_STEP_MS));
      this._stagger = delays;
    } else {
      this._stagger = new Map();
    }
    return list;
  });

  isGhost = (id: string): boolean => this._motion.leavingIds().has(id);

  /** Fondo del ghost: mismo token de tema que el .hand-card--{color} original. */
  ghostBackground(card: Card): string {
    const isHalloween = card.color === CardColor.Halloween;
    const name = (card.kind === CardKind.Treatment && isHalloween)
      ? 'card-treatment-halloween'
      : `card-${card.color}`;
    return `var(--${name})`;
  }

  staggerDelay(id: string): string | null {
    const ms = this._stagger.get(id);
    return ms ? `${ms}ms` : null;
  }

  /**
   * ¿La carta está inerte? Descarte (carta obligatoria), sin conexión o,
   * mientras se elige objetivo, cualquier carta que no sea la seleccionada.
   */
  isCardDisabled(card: Card): boolean {
    if (this.offline()) return true;
    if (this.mustPlayCardId() !== null && this.mustPlayCardId() !== card.id) return true;
    if (this.isTargeting() && this.selectedPlayingCardId() !== card.id) return true;
    return false;
  }

  /** Verbo visible en la carta inerte (evita el "No disponible" genérico). */
  cardDisabledLabel(card: Card): string {
    if (this.offline()) return 'Sin conexión';
    if (this.isTargeting() && this.selectedPlayingCardId() !== card.id) return 'Elige objetivo';
    if (this.mustPlayCardId() !== null) return 'Carta obligatoria';
    return 'No disponible';
  }
}

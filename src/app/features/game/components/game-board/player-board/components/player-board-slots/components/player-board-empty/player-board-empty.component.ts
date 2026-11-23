import { Component, input } from '@angular/core';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';

@Component({
  selector: 'player-board-empty',
  standalone: true,
  imports: [CardIconComponent],
  host: {
    '[class.is-active]': 'isActive()',
  },
  templateUrl: './player-board-empty.component.html',
  styleUrl: './player-board-empty.component.css',
})
export class PlayerBoardEmptyComponent {
  /**
   * Órganos posibles del tablero, en el orden de la paleta de cartas
   * (rojo, verde, azul, amarillo). Cada hueco muestra el icono de su
   * órgano en tenue para que el tablero vacío conserve la forma del lleno.
   */
  readonly slots = ['red', 'green', 'blue', 'yellow'] as const;

  /** Color de cada icono (tokens --organ-* de cards.css). */
  readonly organColor = {
    red: 'var(--organ-red)',
    green: 'var(--organ-green)',
    blue: 'var(--organ-blue)',
    yellow: 'var(--organ-yellow)',
  } as const;

  /** Jugador activo: su tablero vacío se distingue (borde sólido, iconos más presentes). */
  isActive = input(false);
}

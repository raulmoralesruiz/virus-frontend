import { Component, computed, input } from '@angular/core';
import { EmoteEvent } from '@core/models/game.model';

@Component({
  selector: 'game-emote-bubbles',
  standalone: true,
  templateUrl: './emote-bubbles.component.html',
  styleUrl: './emote-bubbles.component.css',
})
export class EmoteBubblesComponent {
  /**
   * Emotes activos DE ESTE JUGADOR (el padre, player-board, ya ha filtrado
   * por playerId sobre la lista global).
   */
  emotes = input.required<EmoteEvent[]>();

  /** Tope de burbujas a la vez: las últimas 5 (las anteriores ya expiraron o están volando). */
  visible = computed(() => this.emotes().slice(-5));
}

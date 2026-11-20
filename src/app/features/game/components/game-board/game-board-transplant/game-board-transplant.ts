import { Component, inject, input, OnChanges } from '@angular/core';
import { Card } from '@core/models/card.model';
import { PublicGameState } from '@core/models/game.model';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';

@Component({
  selector: 'game-board-transplant',
  standalone: true,
  templateUrl: './game-board-transplant.html',
  styleUrl: './game-board-transplant.css',
})
export class GameBoardTransplantComponent implements OnChanges {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);

  gameState = input.required<PublicGameState>();

  state: {
    card: Card;
    firstOrgan: { organId: string; playerId: string } | null;
  } | null = null;

  get meId(): string | null {
    return this._apiPlayer.player()?.id ?? null;
  }

  ngOnChanges() {
    this.cleanTransplantMode();
  }

  startTransplant(
    card: Card,
    firstOrgan: { organId: string; playerId: string }
  ) {
    this.state = { card, firstOrgan };
    this._gameStore.setClientError(
      'Selecciona ahora el segundo órgano para el trasplante.'
    );

    // ⏸️ Fase de selección de objetivo (ruta drag & drop): notifica al server
    // para que pause el timer de turno mientras el jugador elige.
    const rid = this.gameState()?.roomId;
    if (rid) {
      this._gameStore.startSelection(rid, card.id);
    }
  }

  finishTransplant(secondOrgan: { organId: string; playerId: string }) {
    if (!this.state) return;
    const rid = this.gameState().roomId;
    const { card, firstOrgan } = this.state;

    if (!rid || !firstOrgan) {
      this.state = null;
      this._gameStore.setClientError(
        'Error interno: datos de trasplante incompletos.'
      );
      return;
    }

    if (
      firstOrgan.organId === secondOrgan.organId &&
      firstOrgan.playerId === secondOrgan.playerId
    ) {
      this._gameStore.setClientError(
        'No puedes elegir el mismo órgano dos veces.'
      );
      return;
    }

    this._gameStore.playCard(rid, card.id, {
      a: firstOrgan,
      b: secondOrgan,
    });

    this.state = null;
  }

  cancelTransplant() {
    this.state = null;
    this._gameStore.setClientError('Trasplante cancelado.');
    this.emitCancelSelection();
  }

  cleanTransplantMode() {
    const st = this.gameState();
    const meId = this.meId;
    const hadSelection = this.state !== null;

    if (!st) {
      this.state = null;
      if (hadSelection) this.emitCancelSelection();
      return;
    }

    // si no es mi turno, limpiar trasplante automáticamente
    const activePlayerId = st.players[st.turnIndex]?.player.id;
    if (meId !== activePlayerId) {
      this.state = null;
      if (hadSelection) this.emitCancelSelection();
    }
  }

  /**
   * ▶️ Cancela la fase de selección en el server (reanuda el timer).
   * Defensivo: si el server ya limpió la acción pendiente (p. ej. por endTurn
   * o auto-resolución del tope) es un no-op.
   */
  private emitCancelSelection() {
    const rid = this.gameState()?.roomId;
    if (rid) {
      this._gameStore.cancelSelection(rid);
    }
  }
}

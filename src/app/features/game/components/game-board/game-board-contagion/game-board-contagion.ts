import { Component, inject, input, OnChanges } from '@angular/core';
import { Card } from '@core/models/card.model';
import { PublicGameState } from '@core/models/game.model';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { ContagionMove, ContagionState } from './game-board-contagion.model';
import {
  getTemporaryViruses,
  hasTemporaryVirus,
  restoreOriginalVirusPositions,
} from './game-board-contagion.utils';

@Component({
  selector: 'game-board-contagion',
  standalone: true,
  templateUrl: './game-board-contagion.html',
  styleUrl: './game-board-contagion.css',
})
export class GameBoardContagionComponent implements OnChanges {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);

  gameState = input.required<PublicGameState>();
  state: ContagionState | null = null;

  ngOnChanges() {
    this.cleanContagionMode();
  }

  startContagion(card: Card) {
    this.state = { card, assignments: [], temporaryViruses: [] };
    this._gameStore.setClientError(
      'Arrastra tus virus a órganos rivales libres.'
    );

    // ⏸️ Fase de selección de objetivo (ruta drag & drop): notifica al server
    // para que pause el timer de turno mientras el jugador asigna virus.
    const rid = this.gameState()?.roomId;
    if (rid) {
      this._gameStore.startSelection(rid, card.id);
    }
  }

  addAssignment(assign: ContagionMove) {
    if (!this.state) return;

    if (
      this.state.assignments.some(
        (a) =>
          a.fromOrganId === assign.fromOrganId &&
          a.toOrganId === assign.toOrganId
      )
    ) {
      this._gameStore.setClientError('Este virus ya ha sido movido.');
      return;
    }

    this.state.assignments.push({
      fromOrganId: assign.fromOrganId,
      toOrganId: assign.toOrganId,
      toPlayerId: assign.toPlayerId,
    });

    this.state.temporaryViruses.push({
      organId: assign.toOrganId,
      playerId: assign.toPlayerId,
      virus: assign.virus,
      isTemporary: true,
    });

    this._gameStore.setClientError(
      'Virus movido. Pulsa "Finalizar contagio" para confirmar.'
    );
  }

  finishContagion() {
    if (!this.state) return;
    this._gameStore.playCard(
      this.gameState().roomId,
      this.state.card.id,
      this.state.assignments
    );
    this.state = null;
  }

  cancelContagion() {
    if (!this.state) return;
    restoreOriginalVirusPositions(this.state, this.gameState());
    this.state = null;
    this._gameStore.setClientError('Contagio cancelado.');
    this.emitCancelSelection();
  }

  cleanContagionMode() {
    const st = this.gameState();
    const meId = this._apiPlayer.player()?.id;
    const hadSelection = this.state !== null;
    if (!st || meId !== st.players[st.turnIndex]?.player.id) {
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

  getTemporaryVirusesForOrgan(organId: string, playerId: string): Card[] {
    return this.state
      ? getTemporaryViruses(this.state, organId, playerId)
      : [];
  }

  hasTemporaryVirus(organId: string, playerId: string): boolean {
    return this.state
      ? hasTemporaryVirus(this.state, organId, playerId)
      : false;
  }
}

import { Component, computed, inject, input, OnChanges } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { PlayerBoardComponent } from './player-board/player-board';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { Card, CardColor } from '../../../../core/models/card.model';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [PlayerBoardComponent],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoardComponent implements OnChanges {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  state = input.required<PublicGameState>();

  get meId(): string | null {
    return this._apiPlayer.player()?.id ?? null;
  }

  ngOnChanges() {
    this.cleanTransplantMode();
  }

  // lista con todos los ids de slots: slot-<playerId>-<color>
  allSlotIds = computed(() => {
    const st = this.state();
    if (!st) return [];
    const colors = Object.values(CardColor);
    const ids: string[] = [];
    for (const p of st.players) {
      for (const c of colors) {
        ids.push(`slot-${p.player.id}-${c}`);
      }
    }
    return ids;
  });

  // Estado global del trasplante
  transplantState: {
    card: Card;
    firstOrgan: { organId: string; playerId: string } | null;
  } | null = null;

  // Estado contagio
  contagionState: {
    card: Card;
    assignments: {
      fromOrganId: string;
      toOrganId: string;
      toPlayerId: string;
    }[];
  } | null = null;

  startContagion(card: Card) {
    this.contagionState = { card, assignments: [] };
    this._gameStore.setClientError(
      'Arrastra tus virus a órganos rivales libres.'
    );
  }

  addAssignment(assign: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }) {
    if (!this.contagionState) return;
    this.contagionState.assignments.push(assign);
  }

  finishContagion() {
    if (!this.contagionState) return;
    const rid = this.state().roomId;
    this._gameStore.playCard(
      rid,
      this.contagionState.card.id,
      this.contagionState.assignments
    );
    this.contagionState = null;
  }

  cancelContagion() {
    this.contagionState = null;
    this._gameStore.setClientError('Contagio cancelado.');
  }

  startTransplant(
    card: Card,
    firstOrgan: { organId: string; playerId: string }
  ) {
    this.transplantState = { card, firstOrgan };
    this.gameStore.setClientError(
      'Selecciona ahora el segundo órgano para el trasplante.'
    );
  }

  finishTransplant(secondOrgan: { organId: string; playerId: string }) {
    if (!this.transplantState) return;
    const rid = this.state().roomId;
    const { card, firstOrgan } = this.transplantState;

    if (!rid || !firstOrgan) {
      this.transplantState = null;
      this.gameStore.setClientError(
        'Error interno: datos de trasplante incompletos.'
      );
      return;
    }

    if (
      firstOrgan.organId === secondOrgan.organId &&
      firstOrgan.playerId === secondOrgan.playerId
    ) {
      this.gameStore.setClientError(
        'No puedes elegir el mismo órgano dos veces.'
      );
      return;
    }

    this.gameStore.playCard(rid, card.id, {
      a: firstOrgan,
      b: secondOrgan,
    });

    this.transplantState = null;
  }

  cancelTransplant() {
    this.transplantState = null;
    this.gameStore.setClientError('Trasplante cancelado.');
  }

  cleanTransplantMode() {
    const st = this.state();
    const meId = this.meId;

    if (!st) {
      this.transplantState = null;
      return;
    }

    // si no es mi turno, limpiar trasplante automáticamente
    const activePlayerId = st.players[st.turnIndex]?.player.id;
    if (meId !== activePlayerId) {
      this.transplantState = null;
    }
  }
}

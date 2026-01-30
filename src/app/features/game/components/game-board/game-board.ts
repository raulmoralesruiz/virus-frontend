import { Component, computed, inject, input, OnChanges, output } from '@angular/core';
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
    this.cleanContagionMode();
  }

  // lista con todos los ids de slots: slot-<playerId>-<color>
  allSlotIds = computed(() => {
    const st = this.state();
    if (!st) return [];
    
    const ids: string[] = [];
    for (const p of st.players) {
      // Solo generar IDs para huecos que realmente existen (tienen órgano)
      for (const organ of p.board) {
        ids.push(`slot-${p.player.id}-${organ.color}`);
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
    // Nuevo: para trackear virus temporales
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null = null;

  startContagion(card: Card) {
    this.contagionState = {
      card,
      assignments: [],
      temporaryViruses: [],
    };
    this._gameStore.setClientError(
      'Arrastra tus virus a órganos rivales libres.'
    );
  }

  addAssignment(assign: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
    virus: Card;
  }) {
    if (!this.contagionState) return;

    // Verificar que no se haya movido ya este virus
    const alreadyMoved = this.contagionState.assignments.some(
      (a) =>
        a.fromOrganId === assign.fromOrganId && a.toOrganId === assign.toOrganId
    );

    if (alreadyMoved) {
      this._gameStore.setClientError('Este virus ya ha sido movido.');
      return;
    }

    this.contagionState.assignments.push({
      fromOrganId: assign.fromOrganId,
      toOrganId: assign.toOrganId,
      toPlayerId: assign.toPlayerId,
    });

    // Mantener virus temporal en el estado
    this.contagionState.temporaryViruses.push({
      organId: assign.toOrganId,
      playerId: assign.toPlayerId,
      virus: assign.virus,
      isTemporary: true,
    });

    console.log(
      'Virus temporal agregado:',
      this.contagionState.temporaryViruses
    );
    this._gameStore.setClientError(
      'Virus movido. Pulsa "Finalizar contagio" para confirmar.'
    );
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
    if (!this.contagionState) return;

    // Restaurar virus a sus órganos originales
    this.restoreOriginalVirusPositions();

    this.contagionState = null;
    this._gameStore.setClientError('Contagio cancelado.');
  }

  private restoreOriginalVirusPositions() {
    if (!this.contagionState) return;

    const state = this.state();

    // Para cada assignment, restaurar el virus a su posición original
    this.contagionState.assignments.forEach((assignment) => {
      const sourcePlayer = state.players.find((p) =>
        p.board.some((organ) => organ.id === assignment.fromOrganId)
      );

      const targetPlayer = state.players.find(
        (p) => p.player.id === assignment.toPlayerId
      );

      if (sourcePlayer && targetPlayer) {
        const sourceOrgan = sourcePlayer.board.find(
          (o) => o.id === assignment.fromOrganId
        );
        const targetOrgan = targetPlayer.board.find(
          (o) => o.id === assignment.toOrganId
        );

        if (sourceOrgan && targetOrgan) {
          // Encontrar el virus temporal en el órgano destino
          const tempVirusIndex = targetOrgan.attached.findIndex((a) =>
            this.contagionState?.temporaryViruses.some(
              (tv) =>
                tv.organId === assignment.toOrganId && tv.virus.id === a.id
            )
          );

          if (tempVirusIndex >= 0) {
            // Mover virus de vuelta al órgano original
            const [virus] = targetOrgan.attached.splice(tempVirusIndex, 1);
            sourceOrgan.attached.push(virus);
          }
        }
      }
    });
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

  startFailedExperiment = output<{
    card: Card;
    target: { organId: string; playerId: string };
  }>();

  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();

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

  cleanContagionMode() {
    const st = this.state();
    const meId = this.meId;

    if (!st) {
      this.contagionState = null;
      return;
    }

    // si no es mi turno, limpiar trasplante automáticamente
    const activePlayerId = st.players[st.turnIndex]?.player.id;
    if (meId !== activePlayerId) {
      this.contagionState = null;
    }
  }

  // Método helper para obtener virus temporales de un órgano específico
  getTemporaryVirusesForOrgan(organId: string, playerId: string): Card[] {
    if (!this.contagionState) return [];

    return this.contagionState.temporaryViruses
      .filter((tv) => tv.organId === organId && tv.playerId === playerId)
      .map((tv) => ({ ...tv.virus, isTemporary: true } as any));
  }

  // Método helper para verificar si un órgano tiene virus temporales
  hasTemporaryVirus(organId: string, playerId: string): boolean {
    if (!this.contagionState) return false;

    return this.contagionState.temporaryViruses.some(
      (tv) => tv.organId === organId && tv.playerId === playerId
    );
  }
}

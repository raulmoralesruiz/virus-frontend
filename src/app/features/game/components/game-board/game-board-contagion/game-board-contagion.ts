import { Component, inject, input, OnChanges } from '@angular/core';
import { Card } from '../../../../../core/models/card.model';
import { PublicGameState } from '../../../../../core/models/game.model';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';

@Component({
  selector: 'game-board-contagion',
  standalone: true,
  templateUrl: './game-board-contagion.html',
  styleUrl: './game-board-contagion.css'
})
export class GameBoardContagionComponent implements OnChanges {
  private _gameStore = inject(GameStoreService);
  private _apiPlayer = inject(ApiPlayerService);

  gameState = input.required<PublicGameState>();

  state: {
    card: Card;
    assignments: {
      fromOrganId: string;
      toOrganId: string;
      toPlayerId: string;
    }[];
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null = null;

  get meId(): string | null {
    return this._apiPlayer.player()?.id ?? null;
  }

  ngOnChanges() {
    this.cleanContagionMode();
  }

  startContagion(card: Card) {
    this.state = {
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
    if (!this.state) return;

    // Verificar que no se haya movido ya este virus
    const alreadyMoved = this.state.assignments.some(
      (a) =>
        a.fromOrganId === assign.fromOrganId && a.toOrganId === assign.toOrganId
    );

    if (alreadyMoved) {
      this._gameStore.setClientError('Este virus ya ha sido movido.');
      return;
    }

    this.state.assignments.push({
      fromOrganId: assign.fromOrganId,
      toOrganId: assign.toOrganId,
      toPlayerId: assign.toPlayerId,
    });

    // Mantener virus temporal en el estado
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
    const rid = this.gameState().roomId;

    this._gameStore.playCard(
      rid,
      this.state.card.id,
      this.state.assignments
    );
    this.state = null;
  }

  cancelContagion() {
    if (!this.state) return;

    // Restaurar virus a sus órganos originales
    this.restoreOriginalVirusPositions();

    this.state = null;
    this._gameStore.setClientError('Contagio cancelado.');
  }

  private restoreOriginalVirusPositions() {
    if (!this.state) return;

    const state = this.gameState();

    // Para cada assignment, restaurar el virus a su posición original
    this.state.assignments.forEach((assignment) => {
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
            this.state?.temporaryViruses.some(
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

  cleanContagionMode() {
    const st = this.gameState();
    const meId = this.meId;

    if (!st) {
      this.state = null;
      return;
    }

    // si no es mi turno, limpiar trasplante automáticamente
    const activePlayerId = st.players[st.turnIndex]?.player.id;
    if (meId !== activePlayerId) {
      this.state = null;
    }
  }

  // Método helper para obtener virus temporales de un órgano específico
  getTemporaryVirusesForOrgan(organId: string, playerId: string): Card[] {
    if (!this.state) return [];

    return this.state.temporaryViruses
      .filter((tv) => tv.organId === organId && tv.playerId === playerId)
      .map((tv) => ({ ...tv.virus, isTemporary: true } as any));
  }

  // Método helper para verificar si un órgano tiene virus temporales
  hasTemporaryVirus(organId: string, playerId: string): boolean {
    if (!this.state) return false;

    return this.state.temporaryViruses.some(
      (tv) => tv.organId === organId && tv.playerId === playerId
    );
  }
}

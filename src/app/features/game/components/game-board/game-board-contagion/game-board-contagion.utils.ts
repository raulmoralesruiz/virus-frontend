import { PublicGameState } from '../../../../../core/models/game.model';
import { ContagionState } from './game-board-contagion.model';
import { Card } from '../../../../../core/models/card.model';

export function restoreOriginalVirusPositions(
  state: ContagionState,
  gameState: PublicGameState
): void {
  // Para cada assignment, restaurar el virus a su posición original
  state.assignments.forEach((assignment) => {
    const sourcePlayer = gameState.players.find((p) =>
      p.board.some((organ) => organ.id === assignment.fromOrganId)
    );

    const targetPlayer = gameState.players.find(
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
          state.temporaryViruses.some(
            (tv) => tv.organId === assignment.toOrganId && tv.virus.id === a.id
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

export function getTemporaryViruses(
  state: ContagionState,
  organId: string,
  playerId: string
): Card[] {
  return state.temporaryViruses
    .filter((tv) => tv.organId === organId && tv.playerId === playerId)
    .map((tv) => ({ ...tv.virus, isTemporary: true } as any));
}

export function hasTemporaryVirus(
  state: ContagionState,
  organId: string,
  playerId: string
): boolean {
  return state.temporaryViruses.some(
    (tv) => tv.organId === organId && tv.playerId === playerId
  );
}

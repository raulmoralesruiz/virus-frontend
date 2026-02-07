import { PublicGameState, OrganOnBoard } from '../../../../../../../core/models/game.model';
import { PlayerOption, TargetSelectOption } from '../../target-select.models';
import { COLOR_LABELS } from '../../target-select.constants';

export function getContagionPlayerOptions(state: PublicGameState | null, assignments: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
}[]): PlayerOption[] {
    if (!state) return [];
    
    const selectedPlayers = new Set(
      assignments
        .map((assignment) => assignment.toPlayerId)
        .filter((id): id is string => Boolean(id))
    );
    const players: PlayerOption[] = [];
    for (const info of state.players) {
      const hasFreeOrgan = info.board.some((organ: OrganOnBoard) => !organ.attached.length);
      if (hasFreeOrgan || selectedPlayers.has(info.player.id)) {
        players.push({ id: info.player.id, name: info.player.name });
      }
    }
    return players;
}

export function getContagionOrgansForPlayer(state: PublicGameState | null, playerId: string): TargetSelectOption[] {
    if (!playerId || !state) return [];
    const info = state.players.find((p: any) => p.player.id === playerId);
    if (!info) return [];
    return info.board
      .filter((organ: OrganOnBoard) => !organ.attached.length)
      .map((organ: OrganOnBoard) => ({
        playerId: info.player.id,
        playerName: info.player.name,
        organId: organ.id,
        organColor: organ.color,
      }));
}

export function findOrganById(state: PublicGameState | null, organId: string): { organ: OrganOnBoard; playerName: string } | null {
    if (!state) return null;
    for (const info of state.players) {
      const organ = info.board.find((o: OrganOnBoard) => o.id === organId);
      if (organ) {
        return { organ, playerName: info.player.name };
      }
    }
    return null;
}

export function getContagionSourceLabel(state: PublicGameState | null, assignment: { fromOrganId: string }): string {
    const organInfo = findOrganById(state, assignment.fromOrganId);
    if (organInfo) {
        const color = organInfo.organ.color;
        const colorLabel = COLOR_LABELS[color || ''] ?? color;
        return `Desde ${colorLabel}`;
    }
    return `Desde órgano ${assignment.fromOrganId}`;
}

import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { Card } from '@core/models/card.model';
import { TargetSelectOption } from "../target-select/target-select.models";

export class PlayerTargetStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    const targets: TargetSelectOption[] = [];
    for (const p of gameState.players) {
        if (p.player.id !== currentPlayerId) {
          targets.push({
            playerName: p.player.name,
            playerId: p.player.id,
            organId: '', // No specific organ needed
          });
        }
      }
    return targets;
  }

  canPlay(currentSelection: { selectedTarget: PlayCardTarget | null }): boolean {
    return !!currentSelection.selectedTarget;
  }

  whyBlocked(currentSelection: { selectedTarget: PlayCardTarget | null }): string | null {
    return currentSelection.selectedTarget
      ? null
      : 'Falta el objetivo: elige a un jugador antes de jugar.';
  }

  getPlayPayload(currentSelection: { selectedTarget: PlayCardTarget }): any {
    return { playerId: currentSelection.selectedTarget.playerId };
  }
}

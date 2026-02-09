import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { Card } from '@core/models/card.model';
import { TargetSelectOption } from "../target-select/target-select.models";

export class ThiefStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    const targets: TargetSelectOption[] = [];
    // Original logic: lists all organs of all players
    for (const p of gameState.players) {
      for (const o of p.board) {
        targets.push({
          playerName: p.player.name,
          playerId: p.player.id,
          organId: o.id,
          organColor: o.color,
        });
      }
    }
    return targets;
  }

  canPlay(currentSelection: { selectedTarget: PlayCardTarget | null }): boolean {
    return !!currentSelection.selectedTarget;
  }

  getPlayPayload(currentSelection: { selectedTarget: PlayCardTarget }): any {
    return currentSelection.selectedTarget;
  }
}

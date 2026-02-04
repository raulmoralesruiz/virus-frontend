import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState, PlayCardTarget } from "../../../../../core/models/game.model";
import { Card } from "../../../../../core/models/card.model";
import { TargetSelectOption } from "../target-select/target-select.models";

export class TransplantStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    const targets: TargetSelectOption[] = [];
    
    // Original logic for Transplant: lists all organs of all players
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

  canPlay(currentSelection: { selectedTargetA: PlayCardTarget | null, selectedTargetB: PlayCardTarget | null }): boolean {
    return (
        !!currentSelection.selectedTargetA &&
        !!currentSelection.selectedTargetB &&
        currentSelection.selectedTargetA.organId !== currentSelection.selectedTargetB.organId
      );
  }

  getPlayPayload(currentSelection: { selectedTargetA: PlayCardTarget, selectedTargetB: PlayCardTarget }): any {
    return { a: currentSelection.selectedTargetA, b: currentSelection.selectedTargetB };
  }
}

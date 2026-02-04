import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState } from "../../../../../core/models/game.model";
import { Card } from "../../../../../core/models/card.model";
import { TargetSelectOption } from "../target-select/target-select.models";

export class ContagionStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    // Contagion is weird, it doesn't really have "target options" in the same way, 
    // or rather, the "options" are configured per virus instance.
    // The component logic for initializing assignments will be handled by the service/component,
    // but here we can return empty or maybe all possible slots to infect?
    // For now we will return empty and let the specialized UI handle the target selection logic per line.
    return [];
  }

  canPlay(currentSelection: { contagionAssignments: any[] }): boolean {
    return (
        currentSelection.contagionAssignments &&
        currentSelection.contagionAssignments.length > 0 &&
        currentSelection.contagionAssignments.every(
          (assignment) => assignment.toOrganId && assignment.toPlayerId
        )
      );
  }

  getPlayPayload(currentSelection: { contagionAssignments: any[] }): any {
    return currentSelection.contagionAssignments;
  }
}

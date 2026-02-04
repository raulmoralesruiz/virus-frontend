import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState } from "../../../../../core/models/game.model";
import { Card } from "../../../../../core/models/card.model";
import { TargetSelectOption } from "../target-select/target-select.models";

export class SimplePlayStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: any, currentPlayerId?: string): TargetSelectOption[] {
    return []; 
  }

  canPlay(currentSelection: any): boolean {
    return true; // Always playable without extra UI selection
  }

  getPlayPayload(currentSelection: any): any {
    return undefined;
  }
}

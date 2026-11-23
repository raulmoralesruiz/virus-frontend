import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState } from '@core/models/game.model';
import { Card } from '@core/models/card.model';
import { TargetSelectOption } from "../target-select/target-select.models";

export class BodySwapStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: any, currentPlayerId?: string): TargetSelectOption[] {
    return []; // No target options needed for BodySwap as it's just direction
  }

  canPlay(currentSelection: { selectedDirection: 'clockwise' | 'counter-clockwise' | null }): boolean {
    return !!currentSelection.selectedDirection;
  }

  whyBlocked(currentSelection: { selectedDirection: 'clockwise' | 'counter-clockwise' | null }): string | null {
    return currentSelection.selectedDirection
      ? null
      : 'Falta la dirección: elige el sentido en que rotarán los cuerpos.';
  }

  getPlayPayload(currentSelection: { selectedDirection: 'clockwise' | 'counter-clockwise' }): any {
    return { direction: currentSelection.selectedDirection };
  }
}

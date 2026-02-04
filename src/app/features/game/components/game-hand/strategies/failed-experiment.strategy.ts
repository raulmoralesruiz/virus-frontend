import { isInfected, isVaccinated, isImmune } from "../../../../../core/utils/organ.utils";
import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState, PlayCardTarget } from "../../../../../core/models/game.model";
import { Card } from "../../../../../core/models/card.model";
import { TargetSelectOption } from "../target-select/target-select.models";

export class FailedExperimentStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    const targets: TargetSelectOption[] = [];
    for (const p of gameState.players) {
        for (const o of p.board) {
          if ((isInfected(o) || isVaccinated(o)) && !isImmune(o)) {
            targets.push({
              playerName: p.player.name,
              playerId: p.player.id,
              organId: o.id,
              organColor: o.color,
            });
          }
        }
      }
    return targets;
  }

  canPlay(currentSelection: { selectedTarget: PlayCardTarget | null, selectedActionForFailedExperiment: 'medicine' | 'virus' | null }): boolean {
    return !!currentSelection.selectedTarget && !!currentSelection.selectedActionForFailedExperiment;
  }

  getPlayPayload(currentSelection: { selectedTarget: PlayCardTarget, selectedActionForFailedExperiment: 'medicine' | 'virus' }): any {
    return {
        ...currentSelection.selectedTarget,
        action: currentSelection.selectedActionForFailedExperiment,
      };
  }
}

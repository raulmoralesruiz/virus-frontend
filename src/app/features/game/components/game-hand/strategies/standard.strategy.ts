import { CardActionStrategy } from "./card-action.strategy";
import { PublicGameState, PlayCardTarget } from '@core/models/game.model';
import { Card, CardKind, CardColor } from '@core/models/card.model';
import { TargetSelectOption } from "../target-select/target-select.models";

export class StandardStrategy implements CardActionStrategy {
  getTargets(gameState: PublicGameState, card: Card, currentPlayerId?: string): TargetSelectOption[] {
    const targets: TargetSelectOption[] = [];
        
    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
        const self = gameState.players.find(p => p.player.id === currentPlayerId);
        if (self) {
            for (const o of self.board) {
                targets.push({
                    playerName: self.player.name,
                    playerId: self.player.id,
                    organId: o.id,
                    organColor: o.color,
                });
            }
        }
        return targets;
    }

    // Standard Virus/Medicine
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

  getPlayPayload(currentSelection: { selectedTarget: PlayCardTarget | null }): any {
    return currentSelection.selectedTarget;
  }
}

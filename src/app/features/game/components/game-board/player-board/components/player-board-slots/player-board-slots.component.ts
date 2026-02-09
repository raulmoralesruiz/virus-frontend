import { Component, input, output } from '@angular/core';
import { Card } from '@core/models/card.model';
import { PublicGameState, PublicPlayerInfo } from '@core/models/game.model';
import { ContagionState, FailedExperimentEvent, TransplantSelectionEvent, TransplantState, VirusDropEvent } from '../../player-board.models';
import { PlayerBoardEmptyComponent } from './components/player-board-empty/player-board-empty.component';
import { PlayerBoardGridComponent } from './components/player-board-grid/player-board-grid.component';

@Component({
  selector: 'player-board-slots',
  standalone: true,
  imports: [PlayerBoardEmptyComponent, PlayerBoardGridComponent],
  templateUrl: './player-board-slots.component.html',
  styleUrl: './player-board-slots.component.css',
})
export class PlayerBoardSlotsComponent {
  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  allSlotIds = input.required<string[]>();
  roomId = input.required<string>();
  gameState = input.required<PublicGameState>();
  
  contagionState = input<ContagionState | null>(null);
  transplantState = input<TransplantState | null>(null);
  
  getTemporaryVirusesForOrgan = input.required<(organId: string, playerId: string) => Card[]>();
  hasTemporaryVirus = input.required<(organId: string, playerId: string) => boolean>();

  // Outputs corresponding to actions handled in slots
  virusMoved = output<VirusDropEvent>();
  startContagion = output<{ card: Card }>();
  startTransplant = output<TransplantSelectionEvent>();
  finishTransplant = output<{ organId: string; playerId: string }>();
  startFailedExperiment = output<FailedExperimentEvent>();
}

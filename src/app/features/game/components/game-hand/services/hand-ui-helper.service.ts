import { Injectable, inject } from '@angular/core';
import { PlayCardTarget } from '@core/models/game.model';
import { HandStateService } from './hand-state.service';

@Injectable()
export class HandUIHelperService {
  private _state = inject(HandStateService);

  setTarget(target: PlayCardTarget | null) { this._state.selectedTarget.set(target); }
  setTargetA(target: PlayCardTarget | null) { this._state.selectedTargetA.set(target); }
  setTargetB(target: PlayCardTarget | null) { this._state.selectedTargetB.set(target); }
  setDirection(dir: 'clockwise' | 'counter-clockwise' | null) { this._state.selectedDirection.set(dir); }
  setActionForFailedExperiment(action: 'medicine' | 'virus' | null) { this._state.selectedActionForFailedExperiment.set(action); }
  setDragDropSelection(isDragDrop: boolean) { this._state.isDragDropSelection.set(isDragDrop); }

  updateContagionAssignment(index: number, organId: string, playerId: string) {
    this._state.contagionAssignments.update(current => {
      const next = [...current];
      if (next[index]) {
        next[index].toOrganId = organId;
        next[index].toPlayerId = playerId;
      }
      return next;
    });
  }

  setTargetFromIdString(value: string | null, which: 'A' | 'B' | 'single' = 'single') {
    if (!value) {
      if (which === 'A') this.setTargetA(null);
      else if (which === 'B') this.setTargetB(null);
      else this.setTarget(null);
      return;
    }
    const [organId, playerId] = value.split('|');
    const target = { organId, playerId };

    if (which === 'A') this.setTargetA(target);
    else if (which === 'B') this.setTargetB(target);
    else this.setTarget(target);
  }

  setContagionFromIdString(value: string | null, idx: number) {
    if (!value) {
      this.updateContagionAssignment(idx, '', '');
      return;
    }
    const [organId, playerId] = value.split('|');
    this.updateContagionAssignment(idx, organId, playerId);
  }
}

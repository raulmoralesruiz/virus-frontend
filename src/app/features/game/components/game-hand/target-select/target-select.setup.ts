import { effect } from '@angular/core';
import { toOptionValue } from './target-select.utils';

export function setupTargetSelectEffects(comp: any) {
    effect(() => {
      comp.singleSelectionValue = toOptionValue(comp.selectedTarget());
      comp.singlePlayerSelection = comp.selectedTarget()?.playerId ?? '';
    });
    effect(() => {
      comp.transplantSelectionA = toOptionValue(comp.selectedTargetA());
      comp.transplantPlayerA = comp.selectedTargetA()?.playerId ?? '';
    });
    effect(() => {
      comp.transplantSelectionB = toOptionValue(comp.selectedTargetB());
      comp.transplantPlayerB = comp.selectedTargetB()?.playerId ?? '';
    });
    effect(() => {
      if (comp.isSelfTarget && comp.playerOptions.length >= 1 && !comp.singlePlayerSelection) {
        comp.handlePlayerChange(comp.playerOptions[0].id, 'single');
      }
    });
}

import { TestBed } from '@angular/core/testing';
import { HandUIHelperService } from './hand-ui-helper.service';
import { HandStateService } from './hand-state.service';
import { PlayCardTarget } from '@core/models/game.model';

describe('HandUIHelperService', () => {
  let service: HandUIHelperService;
  let state: HandStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HandUIHelperService,
        HandStateService
      ]
    });
    service = TestBed.inject(HandUIHelperService);
    state = TestBed.inject(HandStateService);
  });

  describe('setters', () => {
    it('should set target', () => {
      const target = { organId: 'o', playerId: 'p' } as PlayCardTarget;
      service.setTarget(target);
      expect(state.selectedTarget()).toEqual(target);
    });

    it('should set target A', () => {
      const target = { organId: 'oA', playerId: 'pA' } as PlayCardTarget;
      service.setTargetA(target);
      expect(state.selectedTargetA()).toEqual(target);
    });

    it('should set target B', () => {
      const target = { organId: 'oB', playerId: 'pB' } as PlayCardTarget;
      service.setTargetB(target);
      expect(state.selectedTargetB()).toEqual(target);
    });

    it('should set direction', () => {
      service.setDirection('clockwise');
      expect(state.selectedDirection()).toBe('clockwise');
    });

    it('should set action for failed experiment', () => {
      service.setActionForFailedExperiment('medicine');
      expect(state.selectedActionForFailedExperiment()).toBe('medicine');
    });

    it('should set drag drop selection state', () => {
      service.setDragDropSelection(true);
      expect(state.isDragDropSelection()).toBe(true);
    });
  });

  describe('updateContagionAssignment', () => {
    it('should update specific assignment by index', () => {
      state.contagionAssignments.set([
        { fromOrganId: 'f1', toOrganId: '', toPlayerId: '' }
      ]);
      service.updateContagionAssignment(0, 'to-org', 'to-pl');
      expect(state.contagionAssignments()[0]).toEqual({
        fromOrganId: 'f1', toOrganId: 'to-org', toPlayerId: 'to-pl'
      });
    });

    it('should do nothing if index is out of bounds', () => {
       state.contagionAssignments.set([]);
       service.updateContagionAssignment(0, 'o', 'p');
       expect(state.contagionAssignments()).toEqual([]);
    });
  });

  describe('setTargetFromIdString', () => {
    it('should parse and set single target', () => {
       service.setTargetFromIdString('org1|pl1');
       expect(state.selectedTarget()).toEqual({ organId: 'org1', playerId: 'pl1' });
    });

    it('should parse and set target A', () => {
       service.setTargetFromIdString('orgA|plA', 'A');
       expect(state.selectedTargetA()).toEqual({ organId: 'orgA', playerId: 'plA' });
    });

    it('should parse and set target B', () => {
       service.setTargetFromIdString('orgB|plB', 'B');
       expect(state.selectedTargetB()).toEqual({ organId: 'orgB', playerId: 'plB' });
    });

    it('should handle null by clearing corresponding target', () => {
       service.setTarget({ organId: '1', playerId: '2' } as any);
       service.setTargetA({ organId: '1', playerId: '2' } as any);
       service.setTargetB({ organId: '1', playerId: '2' } as any);

       service.setTargetFromIdString(null, 'single');
       expect(state.selectedTarget()).toBeNull();

       service.setTargetFromIdString(null, 'A');
       expect(state.selectedTargetA()).toBeNull();

       service.setTargetFromIdString(null, 'B');
       expect(state.selectedTargetB()).toBeNull();
    });
  });

  describe('setContagionFromIdString', () => {
    beforeEach(() => {
      state.contagionAssignments.set([
        { fromOrganId: 'f1', toOrganId: 't1', toPlayerId: 'p1' }
      ]);
    });

    it('should parse and update assignment', () => {
      service.setContagionFromIdString('new-o|new-p', 0);
      expect(state.contagionAssignments()[0]).toEqual({
        fromOrganId: 'f1', toOrganId: 'new-o', toPlayerId: 'new-p'
      });
    });

    it('should clear assignment if null provided', () => {
      service.setContagionFromIdString(null, 0);
      expect(state.contagionAssignments()[0]).toEqual({
        fromOrganId: 'f1', toOrganId: '', toPlayerId: ''
      });
    });
  });
});

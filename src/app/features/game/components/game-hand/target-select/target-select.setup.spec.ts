import { TestBed } from '@angular/core/testing';
import { setupTargetSelectEffects } from './target-select.setup';
import { signal, WritableSignal } from '@angular/core';

describe('TargetSelectSetup', () => {
    let mockComp: any;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        mockComp = {
            selectedTarget: signal(null) as WritableSignal<any>,
            selectedTargetA: signal(null) as WritableSignal<any>,
            selectedTargetB: signal(null) as WritableSignal<any>,
            singleSelectionValue: '',
            singlePlayerSelection: '',
            transplantSelectionA: '',
            transplantPlayerA: '',
            transplantSelectionB: '',
            transplantPlayerB: '',
            isSelfTarget: false,
            playerOptions: [],
            handlePlayerChange: jest.fn()
        };
    });

    it('should set single selections', () => {
        TestBed.runInInjectionContext(() => {
            setupTargetSelectEffects(mockComp);
            mockComp.selectedTarget.set({ organId: 'o1', playerId: 'p1' });
            TestBed.flushEffects();
            expect(mockComp.singleSelectionValue).toBe('o1|p1');
            expect(mockComp.singlePlayerSelection).toBe('p1');
        });
    });

    it('should set transplant A selections', () => {
        TestBed.runInInjectionContext(() => {
            setupTargetSelectEffects(mockComp);
            mockComp.selectedTargetA.set({ organId: 'o1', playerId: 'p1' });
            TestBed.flushEffects();
            expect(mockComp.transplantSelectionA).toBe('o1|p1');
            expect(mockComp.transplantPlayerA).toBe('p1');
        });
    });

    it('should set transplant B selections', () => {
        TestBed.runInInjectionContext(() => {
            setupTargetSelectEffects(mockComp);
            mockComp.selectedTargetB.set({ organId: 'o2', playerId: 'p2' });
            TestBed.flushEffects();
            expect(mockComp.transplantSelectionB).toBe('o2|p2');
            expect(mockComp.transplantPlayerB).toBe('p2');
        });
    });

    it('should single select player for self target if not selected', () => {
        TestBed.runInInjectionContext(() => {
            mockComp.isSelfTarget = true;
            mockComp.playerOptions = [{ id: 'p1' }];
            setupTargetSelectEffects(mockComp);
            TestBed.flushEffects();
            expect(mockComp.handlePlayerChange).toHaveBeenCalledWith('p1', 'single');
        });
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetSelectComponent } from './target-select.component';
import { CardKind, TreatmentSubtype, CardColor } from '@core/models/card.model';
import { ComponentRef } from '@angular/core';

describe('TargetSelectComponent', () => {
  let component: TargetSelectComponent;
  let fixture: ComponentFixture<TargetSelectComponent>;
  let componentRef: ComponentRef<TargetSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetSelectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TargetSelectComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('selectedCard', { kind: CardKind.Virus, color: 'red' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed properties based on state', () => {
    it('should compute myPlayerId and myOrganColors if my turn', () => {
      componentRef.setInput('isMyTurn', true);
      componentRef.setInput('publicState', {
        turnIndex: 0,
        players: [
          { player: { id: 'p1' }, board: [{ color: 'red' }] }
        ]
      });
      fixture.detectChanges();
      
      expect(component.myPlayerId()).toBe('p1');
      expect(component.myOrganColors()).toEqual(['red']);
    });

    it('should return undefined and empty array if not my turn or no state', () => {
      componentRef.setInput('isMyTurn', false);
      fixture.detectChanges();
      
      expect(component.myPlayerId()).toBeUndefined();
      expect(component.myOrganColors()).toEqual([]);
    });

    it('should return undefined and empty array if playerInfo is missing', () => {
      componentRef.setInput('isMyTurn', true);
      componentRef.setInput('publicState', {
        turnIndex: 99,
        players: []
      });
      fixture.detectChanges();
      
      expect(component.myPlayerId()).toBeUndefined();
      expect(component.myOrganColors()).toEqual([]);
    });
  });

  describe('getters for card attributes', () => {
    it('should return labels and instructions', () => {
      componentRef.setInput('selectedCard', { kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant });
      fixture.detectChanges();

      expect(component.cardKindLabel).toBe('Tratamiento');
      expect(component.cardSubtypeLabel).toBe('Trasplante');
      expect(component.instruction).toContain('Elige dos órganos distintos');
      
      expect(component.isTransplant).toBe(true);
      expect(component.isContagion).toBe(false);
      expect(component.isFailedExperiment).toBe(false);
      expect(component.isPlayerOnly).toBe(false);
      expect(component.isBodySwap).toBe(false);
      expect(component.isSelfTarget).toBe(false);
      expect(component.requiresTargetSelection).toBe(true);
      expect(component.showSingleTarget).toBe(false);
      expect(component.hasNoOptionsAvailable).toBe(false);
    });
    
    it('should correctly determine showSingleTarget and hasNoOptionsAvailable for others', () => {
      componentRef.setInput('selectedCard', { kind: CardKind.Virus, color: 'blue' });
      fixture.detectChanges();
      expect(component.showSingleTarget).toBe(true);
      expect(component.hasNoOptionsAvailable).toBe(true); // targetOptions is empty by default
    });
  });

  describe('handlers', () => {
    beforeEach(() => {
        jest.spyOn(component.targetChange, 'emit');
    });

    it('should handle TargetChange for single', () => {
        component.handleTargetChange('val1', 'single');
        expect(component.singleSelectionValue).toBe('val1');
        expect(component.targetChange.emit).toHaveBeenCalledWith({ value: 'val1', which: 'single' });
        
        // Default param
        component.handleTargetChange('val-default');
        expect(component.singleSelectionValue).toBe('val-default');
    });

    it('should handle TargetChange for A', () => {
        component.handleTargetChange('val2', 'A');
        expect(component.transplantSelectionA).toBe('val2');
        expect(component.targetChange.emit).toHaveBeenCalledWith({ value: 'val2', which: 'A' });
    });

    it('should handle TargetChange for B', () => {
        component.handleTargetChange('val3', 'B');
        expect(component.transplantSelectionB).toBe('val3');
        expect(component.targetChange.emit).toHaveBeenCalledWith({ value: 'val3', which: 'B' });
    });

    it('should handle PlayerChange for single', () => {
        componentRef.setInput('targetOptions', [{ playerId: 'p1', organId: 'o1', organColor: 'red' }]);
        fixture.detectChanges();

        component.handleTargetChange('o1|p1', 'single'); // Initial setup

        // Clear selection if player changed to one with different organs
        component.handlePlayerChange('p2', 'single');
        expect(component.singlePlayerSelection).toBe('p2');
        expect(component.singleSelectionValue).toBe('');
    });

    it('should handle PlayerChange for PlayerOnly cards', () => {
        componentRef.setInput('selectedCard', { kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError });
        fixture.detectChanges();

        component.handlePlayerChange('p2', 'single');
        expect(component.singleSelectionValue).toBe('|p2');
        
        component.handlePlayerChange('', 'single');
        expect(component.singleSelectionValue).toBe('');
    });

    it('should handle PlayerChange for A and B', () => {
        component.handlePlayerChange('p1', 'A');
        expect(component.transplantPlayerA).toBe('p1');
        
        component.handlePlayerChange('p2', 'B');
        expect(component.transplantPlayerB).toBe('p2');
    });

    it('should NOT clear selection if player changed but selection is still valid for A/B/single', () => {
        componentRef.setInput('targetOptions', [{ playerId: 'p1', organId: 'o1', organColor: 'red', playerName: 'P1' }]);
        fixture.detectChanges();

        component.handleTargetChange('o1|p1', 'single');
        component.handlePlayerChange('p1', 'single');
        expect(component.singleSelectionValue).toBe('o1|p1');

        component.handleTargetChange('o1|p1', 'A');
        component.handlePlayerChange('p1', 'A');
        expect(component.transplantSelectionA).toBe('o1|p1');

        component.handleTargetChange('o1|p1', 'B');
        component.handlePlayerChange('p1', 'B');
        expect(component.transplantSelectionB).toBe('o1|p1');
    });

    it('should clear selection if player changed to one with different organs for A and B', () => {
        componentRef.setInput('targetOptions', [{ playerId: 'p1', organId: 'o1', organColor: 'red', playerName: 'P1' }]);
        fixture.detectChanges();

        component.handleTargetChange('o1|p1', 'A');
        component.handleTargetChange('o1|p1', 'B');
        
        component.handlePlayerChange('p2', 'A');
        expect(component.transplantSelectionA).toBe('');

        component.handlePlayerChange('p2', 'B');
        expect(component.transplantSelectionB).toBe('');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHandComponent } from './game-hand';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GameHand', () => {
  let component: GameHandComponent;
  let fixture: ComponentFixture<GameHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHandComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mustPlayCardId', () => {
    it('should return null if no publicState or apiPlayer', () => {
      expect(component.mustPlayCardId()).toBeNull();
    });

    it('should return cardId if pendingAction is ApparitionDecision and is me', () => {
      (component as any)._apiPlayer = { player: () => ({ id: 'p1', name: 'p1' }) };
      fixture.componentRef.setInput('publicState', {
        pendingAction: { type: 'ApparitionDecision', playerId: 'p1', cardId: 'c1' }
      } as any);
      expect(component.mustPlayCardId()).toBe('c1');
    });

    it('should return null if pendingAction is not me', () => {
      (component as any)._apiPlayer = { player: () => ({ id: 'p2', name: 'p2' }) };
      fixture.componentRef.setInput('publicState', {
        pendingAction: { type: 'ApparitionDecision', playerId: 'p1', cardId: 'c1' }
      } as any);
      expect(component.mustPlayCardId()).toBeNull();
    });
  });

  describe('boardIds', () => {
    it('should return empty array if publicState is null', () => {
      expect(component.boardIds()).toEqual([]);
    });

    it('should generate board and slot ids for players', () => {
      fixture.componentRef.setInput('publicState', {
        players: [
          { player: { id: 'p1' }, board: [{ color: 'red' }, { color: 'blue' }] },
          { player: { id: 'p2' }, board: [] }
        ]
      } as any);
      expect(component.boardIds()).toEqual([
        'board-p1',
        'slot-p1-red',
        'slot-p1-blue',
        'board-p2'
      ]);
    });
  });

  describe('ngOnChanges', () => {
    it('should handle isMyTurn change to true', () => {
      const clearSpy = jest.spyOn(component.handAction, 'clearSelection');
      component.ngOnChanges({
        isMyTurn: { previousValue: false, currentValue: true, firstChange: false } as any
      });
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should handle isMyTurn change to false', () => {
      const clearSpy = jest.spyOn(component.handAction, 'clearSelection');
      const resetSpy = jest.spyOn(component.handDiscard, 'reset');
      component.ngOnChanges({
        isMyTurn: { previousValue: true, currentValue: false, firstChange: false } as any
      });
      expect(clearSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should ignore first change', () => {
      const clearSpy = jest.spyOn(component.handAction, 'clearSelection');
      component.ngOnChanges({
        isMyTurn: { previousValue: false, currentValue: true, firstChange: true } as any
      });
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectCardToPlay & selectCardAndTarget', () => {
    it('should delegate selectCardToPlay to handAction', () => {
      const spy = jest.spyOn(component.handAction, 'selectCard');
      const card = { id: 1 } as any;
      component.selectCardToPlay(card);
      expect(spy).toHaveBeenCalledWith(card, null);
    });

    it('should handle selectCardAndTarget', () => {
      const spyAction = jest.spyOn(component.handAction, 'selectCard');
      const spyTarget = jest.spyOn(component.handUIHelper, 'setTarget');
      const spyDrag = jest.spyOn(component.handUIHelper, 'setDragDropSelection');
      const card = { id: 1 } as any;
      const target = { type: 'board' } as any;
      component.selectCardAndTarget(card, target);
      
      expect(spyAction).toHaveBeenCalledWith(card, null);
      expect(spyTarget).toHaveBeenCalledWith(target);
      expect(spyDrag).toHaveBeenCalledWith(true);
    });
  });

  describe('keepApparitionCard', () => {
    it('should do nothing if mustPlayCardId is null', () => {
      const storeSpy = jest.spyOn(component['_gameStore'], 'endTurn');
      component.keepApparitionCard();
      expect(storeSpy).not.toHaveBeenCalled();
    });

    it('should end turn if mustPlayCardId is valid', () => {
      const storeSpy = jest.spyOn(component['_gameStore'], 'endTurn');
      (component as any)._apiPlayer = { player: () => ({ id: 'p1', name: 'p1' }) };
      fixture.componentRef.setInput('publicState', {
        roomId: 'room1',
        pendingAction: { type: 'ApparitionDecision', playerId: 'p1', cardId: 'c1' }
      } as any);
      
      component.keepApparitionCard();
      expect(storeSpy).toHaveBeenCalledWith('room1');
    });
  });

  describe('ResizeObserver', () => {
    it('should emit heightChange on resize', () => {
      const emitSpy = jest.spyOn(component.heightChange, 'emit');
      
      let observedCallback: any;
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
        constructor(callback: any) {
          observedCallback = callback;
        }
      } as any;
      
      component.ngAfterViewInit();
      expect(observedCallback).toBeDefined();
      
      observedCallback([{ contentRect: { height: 100 } }]);
      expect(emitSpy).toHaveBeenCalledWith(100);
      
      component.ngOnDestroy();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardContagionComponent } from './game-board-contagion';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { signal } from '@angular/core';
import { restoreOriginalVirusPositions, getTemporaryViruses, hasTemporaryVirus } from './game-board-contagion.utils';

jest.mock('./game-board-contagion.utils', () => ({
    restoreOriginalVirusPositions: jest.fn(),
    getTemporaryViruses: jest.fn(),
    hasTemporaryVirus: jest.fn()
}));

describe('GameBoardContagionComponent', () => {
  let component: GameBoardContagionComponent;
  let fixture: ComponentFixture<GameBoardContagionComponent>;

  const mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn()
  };

  const mockApiPlayer = {
      player: signal<any>(null)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardContagionComponent],
      providers: [
          { provide: GameStoreService, useValue: mockGameStore },
          { provide: ApiPlayerService, useValue: mockApiPlayer }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameBoardContagionComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
      expect(component.state).toBeNull();
  });

  describe('cleanContagionMode', () => {
      it('should clean state if no gamestate', () => {
          fixture.componentRef.setInput('gameState', null);
          component.state = {} as any;
          component.cleanContagionMode();
          expect(component.state).toBeNull();
      });

      it('should clean state if it is not my turn', () => {
          fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p2' } }], turnIndex: 0 });
          mockApiPlayer.player.set({ id: 'p1' });
          component.state = {} as any;
          
          component.cleanContagionMode();
          expect(component.state).toBeNull();
      });

      it('should NOT clean state if it is my turn', () => {
          fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p1' } }], turnIndex: 0 });
          mockApiPlayer.player.set({ id: 'p1' });
          component.state = { card: { id: 'c1' } } as any;
          
          component.cleanContagionMode();
          expect(component.state).not.toBeNull();
      });

      it('should trigger mode clean on ngOnChanges', () => {
          jest.spyOn(component, 'cleanContagionMode');
          fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p2' } }], turnIndex: 0 });
          component.ngOnChanges();
          expect(component.cleanContagionMode).toHaveBeenCalled();
      });
  });

  describe('startContagion', () => {
      it('should set initial state', () => {
          component.startContagion({ id: 'c1' } as any);
          expect(component.state?.card.id).toBe('c1');
          expect(component.state?.assignments).toEqual([]);
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Arrastra tus virus a órganos rivales libres.');
      });
  });

  describe('addAssignment', () => {
      it('should do nothing if no state', () => {
          component.state = null;
          component.addAssignment({} as any);
          expect(mockGameStore.setClientError).not.toHaveBeenCalled();
      });

      it('should prevent duplicate moves', () => {
          component.state = { assignments: [{ fromOrganId: 'o1', toOrganId: 'o2' }] } as any;
          component.addAssignment({ fromOrganId: 'o1', toOrganId: 'o2' } as any);
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Este virus ya ha sido movido.');
      });

      it('should add successful assignment', () => {
          component.state = { card: { id: 'c1' }, assignments: [], temporaryViruses: [] };
          component.addAssignment({ fromOrganId: 'o1', toOrganId: 'o2', toPlayerId: 'p2', virus: { id: 'v1' } } as any);
          
          expect(component.state.assignments.length).toBe(1);
          expect(component.state.temporaryViruses.length).toBe(1);
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Virus movido. Pulsa "Finalizar contagio" para confirmar.');
      });
  });

  describe('finishContagion', () => {
      it('should do nothing if no state', () => {
          component.state = null;
          component.finishContagion();
          expect(mockGameStore.playCard).not.toHaveBeenCalled();
      });

      it('should playCard and reset state', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = { card: { id: 'c1' }, assignments: [{ fromOrganId: 'o1' }] } as any;
          
          component.finishContagion();
          
          expect(mockGameStore.playCard).toHaveBeenCalledWith('r1', 'c1', [{ fromOrganId: 'o1' }]);
          expect(component.state).toBeNull();
      });
  });

  describe('cancelContagion', () => {
      it('should do nothing if no state', () => {
          component.state = null;
          component.cancelContagion();
          expect(restoreOriginalVirusPositions).not.toHaveBeenCalled();
      });

      it('should restore positions and reset state', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = { card: { id: 'c1' } } as any;

          component.cancelContagion();

          expect(restoreOriginalVirusPositions).toHaveBeenCalledWith(expect.any(Object), { roomId: 'r1' });
          expect(component.state).toBeNull();
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Contagio cancelado.');
      });
  });

  describe('queries', () => {
      it('should return empty array if no state for temporary viruses', () => {
          component.state = null;
          expect(component.getTemporaryVirusesForOrgan('o1', 'p1')).toEqual([]);
          expect(getTemporaryViruses).not.toHaveBeenCalled();
      });

      it('should call util for temporary viruses', () => {
          component.state = { card: { id: 'c1' } } as any;
          (getTemporaryViruses as jest.Mock).mockReturnValue([{ id: 'v1' }]);
          
          const result = component.getTemporaryVirusesForOrgan('o1', 'p1');
          expect(getTemporaryViruses).toHaveBeenCalledWith(component.state, 'o1', 'p1');
          expect(result.length).toBe(1);
      });

      it('should return false if no state for hasTemporaryVirus', () => {
          component.state = null;
          expect(component.hasTemporaryVirus('o1', 'p1')).toBe(false);
          expect(hasTemporaryVirus).not.toHaveBeenCalled();
      });

      it('should call util for hasTemporaryVirus', () => {
          component.state = { card: { id: 'c1' } } as any;
          (hasTemporaryVirus as jest.Mock).mockReturnValue(true);
          
          const result = component.hasTemporaryVirus('o1', 'p1');
          expect(hasTemporaryVirus).toHaveBeenCalledWith(component.state, 'o1', 'p1');
          expect(result).toBe(true);
      });
  });
});

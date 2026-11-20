import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardTransplantComponent } from './game-board-transplant';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { signal } from '@angular/core';

describe('GameBoardTransplantComponent', () => {
  let component: GameBoardTransplantComponent;
  let fixture: ComponentFixture<GameBoardTransplantComponent>;

  const mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn(),
      startSelection: jest.fn(),
      cancelSelection: jest.fn()
  };

  const mockApiPlayer = {
      player: signal<any>(null)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardTransplantComponent],
      providers: [
          { provide: GameStoreService, useValue: mockGameStore },
          { provide: ApiPlayerService, useValue: mockApiPlayer }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameBoardTransplantComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
      expect(component.state).toBeNull();
      expect(component.meId).toBeNull();
  });

  describe('cleanTransplantMode', () => {
      it('should return immediately and set null if no state', () => {
          fixture.componentRef.setInput('gameState', null);
          component.state = {} as any;
          component.cleanTransplantMode();
          expect(component.state).toBeNull();
      });

      it('should set state to null if it is not my turn', () => {
           fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p2' } }], turnIndex: 0 });
           mockApiPlayer.player.set({ id: 'p1' });
           component.state = {} as any;
           component.cleanTransplantMode();
           expect(component.state).toBeNull();
      });

      it('should not set state to null if it is my turn', () => {
           fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p1' } }], turnIndex: 0 });
           mockApiPlayer.player.set({ id: 'p1' });
           component.state = { card: { id: 'c1' }, firstOrgan: { organId: 'o1', playerId: 'p2' } } as any;
           component.cleanTransplantMode();
           expect(component.state).not.toBeNull();
      });

      it('should run clean on changes', () => {
          jest.spyOn(component, 'cleanTransplantMode');
          fixture.componentRef.setInput('gameState', { players: [{ player: { id: 'p2' } }], turnIndex: 0 });
          component.ngOnChanges();
          expect(component.cleanTransplantMode).toHaveBeenCalled();
      });

      it('▶️ debe reanudar el timer (cancelSelection) si el turno cambia con selección abierta', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1', players: [{ player: { id: 'p2' } }], turnIndex: 0 });
          mockApiPlayer.player.set({ id: 'p1' });
          component.state = { card: { id: 'c1' } } as any;
          component.cleanTransplantMode();
          expect(component.state).toBeNull();
          expect(mockGameStore.cancelSelection).toHaveBeenCalledWith('r1');
      });
  });

  describe('startTransplant', () => {
      it('should setup state correctly', () => {
          fixture.componentRef.setInput('gameState', {});
          component.startTransplant({ id: 'c1'} as any, { organId: 'o1', playerId: 'p1'} as any);
          expect(component.state?.card.id).toBe('c1');
          expect(component.state?.firstOrgan?.organId).toBe('o1');
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Selecciona ahora el segundo órgano para el trasplante.');
      });

      it('⏸️ debe pausar el timer (startSelection) al iniciar la selección por drag', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.startTransplant({ id: 'c1'} as any, { organId: 'o1', playerId: 'p1'} as any);
          expect(mockGameStore.startSelection).toHaveBeenCalledWith('r1', 'c1');
      });

      it('⏸️ no debe pausar si no hay roomId disponible', () => {
          fixture.componentRef.setInput('gameState', {});
          component.startTransplant({ id: 'c1'} as any, { organId: 'o1', playerId: 'p1'} as any);
          expect(mockGameStore.startSelection).not.toHaveBeenCalled();
      });
  });

  describe('finishTransplant', () => {
      it('should return if no state', () => {
          component.state = null;
          component.finishTransplant({ organId: 'o2', playerId: 'p2' });
          expect(mockGameStore.playCard).not.toHaveBeenCalled();
      });

      it('should prevent choosing same organ', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = { 
              card: { id: 'c1' }, 
              firstOrgan: { organId: 'o1', playerId: 'p1'} 
          } as any;
          
          component.finishTransplant({ organId: 'o1', playerId: 'p1' });
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes elegir el mismo órgano dos veces.');
          expect(mockGameStore.playCard).not.toHaveBeenCalled();
      });

      it('should block if incomplete state or no roomid', () => {
          fixture.componentRef.setInput('gameState', { roomId: '' });
          component.state = { card: { id: 'c1'} } as any; // incomplete
          component.finishTransplant({ organId: 'o2', playerId: 'p2' });
          expect(component.state).toBeNull();
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Error interno: datos de trasplante incompletos.');
          expect(mockGameStore.playCard).not.toHaveBeenCalled();
      });

      it('should dispatch playCard on success', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = { 
              card: { id: 'c1' }, 
              firstOrgan: { organId: 'o1', playerId: 'p1'} 
          } as any;
          
          component.finishTransplant({ organId: 'o2', playerId: 'p2' });
          expect(mockGameStore.playCard).toHaveBeenCalledWith('r1', 'c1', {
              a: { organId: 'o1', playerId: 'p1' },
              b: { organId: 'o2', playerId: 'p2' }
          });
          expect(component.state).toBeNull();
      });
  });

  describe('cancelTransplant', () => {
      it('should cancel transplant correctly', () => {
          fixture.componentRef.setInput('gameState', {});
          component.state = {} as any;
          component.cancelTransplant();
          expect(component.state).toBeNull();
          expect(mockGameStore.setClientError).toHaveBeenCalledWith('Trasplante cancelado.');
      });

      it('▶️ debe reanudar el timer (cancelSelection) al cancelar la selección', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = { card: { id: 'c1' } } as any;
          component.cancelTransplant();
          expect(mockGameStore.cancelSelection).toHaveBeenCalledWith('r1');
      });
  });

  describe('finishTransplant y cancelSelection', () => {
      it('no debe cancelar la selección al confirmar (la limpia el server al jugar)', () => {
          fixture.componentRef.setInput('gameState', { roomId: 'r1' });
          component.state = {
              card: { id: 'c1' },
              firstOrgan: { organId: 'o1', playerId: 'p1' }
          } as any;

          component.finishTransplant({ organId: 'o2', playerId: 'p2' });

          expect(mockGameStore.playCard).toHaveBeenCalled();
          expect(mockGameStore.cancelSelection).not.toHaveBeenCalled();
      });
  });
});

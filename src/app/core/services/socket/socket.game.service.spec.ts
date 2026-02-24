import { TestBed } from '@angular/core/testing';
import { SocketGameService } from './socket.game.service';
import { SocketGameStateService } from './game/socket.game.state.service';
import { SocketGameActionService } from './game/socket.game.action.service';
import { SocketGameListenerService } from './game/socket.game.listener.service';
import { signal } from '@angular/core';

describe('SocketGameService', () => {
  let service: SocketGameService;
  
  const mockState = {
      publicState: signal(null),
      hand: signal([]),
      lastError: signal(null),
      winner: signal(null),
      activeRoomId: 'r1',
      reset: jest.fn(),
      setLastError: jest.fn()
  };
  const mockActions = {
      startGame: jest.fn(),
      requestGameState: jest.fn(),
      drawCard: jest.fn(),
      endTurn: jest.fn(),
      playCard: jest.fn(),
      discardCards: jest.fn(),
      resetRoom: jest.fn()
  };
  const mockListeners = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            SocketGameService,
            { provide: SocketGameStateService, useValue: mockState },
            { provide: SocketGameActionService, useValue: mockActions },
            { provide: SocketGameListenerService, useValue: mockListeners }
        ]
    });
    service = TestBed.inject(SocketGameService);
    jest.clearAllMocks();
  });

  it('should delegate action methods properly', () => {
      service.startGame('r1');
      expect(mockActions.startGame).toHaveBeenCalledWith('r1');

      service.requestGameState('r1');
      expect(mockActions.requestGameState).toHaveBeenCalledWith('r1');

      service.drawCard('r1');
      expect(mockActions.drawCard).toHaveBeenCalledWith('r1');

      service.endTurn('r1');
      expect(mockActions.endTurn).toHaveBeenCalledWith('r1');

      const playPayload = { roomId: 'r1', playerId: 'p1', cardId: 'c1' };
      service.playCard(playPayload);
      expect(mockActions.playCard).toHaveBeenCalledWith(playPayload);

      const discardPayload = { roomId: 'r1', playerId: 'p1', cardIds: ['c1'] };
      service.discardCards(discardPayload);
      expect(mockActions.discardCards).toHaveBeenCalledWith(discardPayload);

      service.resetRoom('r1');
      expect(mockActions.resetRoom).toHaveBeenCalledWith('r1');
      expect(mockState.reset).toHaveBeenCalled();
  });

  describe('Local State Management', () => {
      it('clearLastError should clear state error', () => {
          service.clearLastError();
          expect(mockState.setLastError).toHaveBeenCalledWith(null);
      });

      it('setClientError should set state error', () => {
          service.setClientError('msg');
          expect(mockState.setLastError).toHaveBeenCalledWith('msg');
      });

      it('leaveGame without roomId should reset state', () => {
          service.leaveGame();
          expect(mockState.reset).toHaveBeenCalled();
      });

      it('leaveGame with active roomId should reset state', () => {
          service.leaveGame('r1');
          expect(mockState.reset).toHaveBeenCalled();
      });

      it('leaveGame with non-active roomId should not reset state', () => {
          service.leaveGame('r2');
          expect(mockState.reset).not.toHaveBeenCalled();
      });
  });
});

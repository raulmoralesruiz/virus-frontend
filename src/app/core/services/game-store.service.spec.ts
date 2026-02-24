import { TestBed } from '@angular/core/testing';
import { GameStoreService } from './game-store.service';
import { SocketGameService } from '../services/socket/socket.game.service';
import { ApiPlayerService } from './api/api.player.service';
import { RoomStoreService } from './room-store.service';
import { GameNavigationService } from './game/game-navigation.service';
import { GameUiService } from './game/game-ui.service';
import { GamePlayService } from './game/game-play.service';
import { signal } from '@angular/core';

describe('GameStoreService', () => {
  let service: GameStoreService;
  
  const mockSocketGame = {
      publicState: signal<any>(null),
      hand: signal<any>([]),
      lastError: signal<any>(null),
      winner: signal<any>(null),
      startGame: jest.fn(),
      requestGameState: jest.fn(),
      drawCard: jest.fn(),
      endTurn: jest.fn(),
      resetRoom: jest.fn(),
      setClientError: jest.fn(),
      clearLastError: jest.fn(),
      leaveGame: jest.fn()
  };
  const mockApiPlayer = {
      player: signal<any>(null)
  };
  const mockRoomStore = {
      leaveRoom: jest.fn()
  };
  const mockNav = {
      goHome: jest.fn(),
      goToRoomList: jest.fn()
  };
  const mockUi = {
      historyOpen: signal(false),
      leavingOpen: signal(false),
      openHistoryModal: jest.fn(),
      closeHistoryModal: jest.fn(),
      openLeaveModal: jest.fn(),
      closeLeaveModal: jest.fn(),
      reset: jest.fn()
  };
  const mockPlay = {
      playCard: jest.fn(),
      discardCards: jest.fn(),
      handleTurnTimeout: jest.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            GameStoreService,
            { provide: SocketGameService, useValue: mockSocketGame },
            { provide: ApiPlayerService, useValue: mockApiPlayer },
            { provide: RoomStoreService, useValue: mockRoomStore },
            { provide: GameNavigationService, useValue: mockNav },
            { provide: GameUiService, useValue: mockUi },
            { provide: GamePlayService, useValue: mockPlay },
        ]
    });
    service = TestBed.inject(GameStoreService);
    jest.clearAllMocks();
  });

  describe('isMyTurn', () => {
    it('should be true if it is my turn', () => {
        mockApiPlayer.player.set({ id: 'p1' });
        mockSocketGame.publicState.set({ turnIndex: 0, players: [{ player: { id: 'p1' } }] });
        expect(service.isMyTurn()).toBe(true);
    });

    it('should be false if not my turn', () => {
        mockApiPlayer.player.set({ id: 'p2' });
        mockSocketGame.publicState.set({ turnIndex: 0, players: [{ player: { id: 'p1' } }] });
        expect(service.isMyTurn()).toBe(false);
    });

    it('should be false if missing state or player', () => {
        mockApiPlayer.player.set(null);
        expect(service.isMyTurn()).toBe(false);
    });
  });

  describe('other computed properties', () => {
    it('should compute remainingSeconds and history safely', () => {
        expect(service.remainingSeconds()).toBe(0);
        expect(service.history()).toEqual([]);

        mockSocketGame.publicState.set({ remainingSeconds: 50, history: [{ id: 'h1' }] });
        expect(service.remainingSeconds()).toBe(50);
        expect(service.history()).toEqual([{ id: 'h1' }]);
    });
  });

  describe('delegation methods', () => {
    it('should call socket methods', () => {
        service.startGame('r1'); expect(mockSocketGame.startGame).toHaveBeenCalledWith('r1');
        service.getState('r1'); expect(mockSocketGame.requestGameState).toHaveBeenCalledWith('r1');
        service.drawCard('r1'); expect(mockSocketGame.drawCard).toHaveBeenCalledWith('r1');
        service.endTurn('r1'); expect(mockSocketGame.endTurn).toHaveBeenCalledWith('r1');
        service.resetRoom('r1'); expect(mockSocketGame.resetRoom).toHaveBeenCalledWith('r1');
        service.setClientError('err'); expect(mockSocketGame.setClientError).toHaveBeenCalledWith('err');
        service.clearError(); expect(mockSocketGame.clearLastError).toHaveBeenCalled();
    });

    it('should call play methods', () => {
        service.playCard('r1', 'c1'); expect(mockPlay.playCard).toHaveBeenCalledWith('r1', 'c1', undefined);
        service.discardCards('r1', ['c1']); expect(mockPlay.discardCards).toHaveBeenCalledWith('r1', ['c1']);
        service.handleTurnTimeout('r1'); expect(mockPlay.handleTurnTimeout).toHaveBeenCalledWith('r1');
    });

    it('should call nav methods', () => {
        service.goHome(); expect(mockNav.goHome).toHaveBeenCalled();
        service.goToRoomList(); expect(mockNav.goToRoomList).toHaveBeenCalled();
    });

    it('should call ui methods', () => {
        service.openHistoryModal(); expect(mockUi.openHistoryModal).toHaveBeenCalled();
        service.closeHistoryModal(); expect(mockUi.closeHistoryModal).toHaveBeenCalled();
        service.openLeaveModal(); expect(mockUi.openLeaveModal).toHaveBeenCalled();
        service.closeLeaveModal(); expect(mockUi.closeLeaveModal).toHaveBeenCalled();
    });
  });

  describe('leaveGame', () => {
    it('should do nothing if no player', () => {
        mockApiPlayer.player.set(null);
        service.leaveGame('r1');
        expect(mockSocketGame.leaveGame).not.toHaveBeenCalled();
    });

    it('should call dependencies to leave game', () => {
        mockApiPlayer.player.set({ id: 'p1' });
        service.leaveGame('r1');
        expect(mockSocketGame.leaveGame).toHaveBeenCalledWith('r1');
        expect(mockRoomStore.leaveRoom).toHaveBeenCalledWith('r1', { id: 'p1' });
        expect(mockUi.reset).toHaveBeenCalled();
        expect(mockNav.goToRoomList).toHaveBeenCalled();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { GamePlayService } from './game-play.service';
import { SocketGameService } from '../../services/socket/socket.game.service';
import { ApiPlayerService } from '../api/api.player.service';
import { signal } from '@angular/core';

describe('GamePlayService', () => {
  let service: GamePlayService;

  const mockSocketGame = {
      hand: signal<any[]>([]),
      playCard: jest.fn(),
      discardCards: jest.fn()
  };
  const mockApiPlayer = {
      player: signal<any>(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            GamePlayService,
            { provide: SocketGameService, useValue: mockSocketGame },
            { provide: ApiPlayerService, useValue: mockApiPlayer }
        ]
    });
    service = TestBed.inject(GamePlayService);
    jest.clearAllMocks();
  });

  describe('playCard', () => {
      it('should do nothing if player is null', () => {
          mockApiPlayer.player.set(null);
          service.playCard('r1', 'c1');
          expect(mockSocketGame.playCard).not.toHaveBeenCalled();
      });

      it('should call socket playCard with target', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          const target = { targetType: 'self' } as any;
          service.playCard('r1', 'c1', target);
          expect(mockSocketGame.playCard).toHaveBeenCalledWith({
              roomId: 'r1',
              playerId: 'p1',
              cardId: 'c1',
              target
          });
      });
  });

  describe('discardCards', () => {
      it('should do nothing if player is null', () => {
          mockApiPlayer.player.set(null);
          service.discardCards('r1', ['c1']);
          expect(mockSocketGame.discardCards).not.toHaveBeenCalled();
      });

      it('should call socket discardCards', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          service.discardCards('r1', ['c1']);
          expect(mockSocketGame.discardCards).toHaveBeenCalledWith({
              roomId: 'r1',
              playerId: 'p1',
              cardIds: ['c1']
          });
      });
  });

  describe('handleTurnTimeout', () => {
      it('should do nothing if hand is empty', () => {
          mockSocketGame.hand.set([]);
          service.handleTurnTimeout('r1');
          expect(mockSocketGame.discardCards).not.toHaveBeenCalled();
      });

      it('should select random card and discard it', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          mockSocketGame.hand.set([{ id: 'c1' }, { id: 'c2' }]);
          
          // force Math.random to always pick index 1
          jest.spyOn(Math, 'random').mockReturnValue(0.99);

          service.handleTurnTimeout('r1');

          expect(mockSocketGame.discardCards).toHaveBeenCalledWith({
              roomId: 'r1',
              playerId: 'p1',
              cardIds: ['c2']
          });

          jest.restoreAllMocks();
      });
  });
});

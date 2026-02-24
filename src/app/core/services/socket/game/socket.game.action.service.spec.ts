import { TestBed } from '@angular/core/testing';
import { SocketGameActionService } from './socket.game.action.service';
import { SocketService } from '../socket.service';
import { GAME_CONSTANTS } from '../../../constants/game.constants';

describe('SocketGameActionService', () => {
  let service: SocketGameActionService;
  
  const mockSocketService = {
      emit: jest.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            SocketGameActionService,
            { provide: SocketService, useValue: mockSocketService }
        ]
    });
    service = TestBed.inject(SocketGameActionService);
    jest.clearAllMocks();
  });

  it('startGame should emit GAME_START', () => {
      service.startGame('r1');
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_START, { roomId: 'r1' });
  });

  it('requestGameState should emit GAME_GET_STATE', () => {
      service.requestGameState('r1');
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_GET_STATE, { roomId: 'r1' });
  });

  it('drawCard should emit GAME_DRAW', () => {
      service.drawCard('r1');
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_DRAW, { roomId: 'r1' });
  });

  it('endTurn should emit GAME_END_TURN', () => {
      service.endTurn('r1');
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_END_TURN, { roomId: 'r1' });
  });

  it('playCard should emit GAME_PLAY_CARD', () => {
      const payload = { roomId: 'r1', playerId: 'p1', cardId: 'c1' };
      service.playCard(payload);
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_PLAY_CARD, payload);
  });

  it('discardCards should emit GAME_DISCARD', () => {
      const payload = { roomId: 'r1', playerId: 'p1', cardIds: ['c1'] };
      service.discardCards(payload);
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_DISCARD, payload);
  });

  it('resetRoom should emit ROOM_RESET', () => {
      service.resetRoom('r1');
      expect(mockSocketService.emit).toHaveBeenCalledWith(GAME_CONSTANTS.ROOM_RESET, { roomId: 'r1' });
  });
});

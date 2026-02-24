import { TestBed } from '@angular/core/testing';
import { DropOrganHandler } from './drop-organ.handler';
import { GameStoreService } from '@core/services/game-store.service';
import { Card, CardColor, CardKind } from '@core/models/card.model';
import { PublicPlayerInfo, OrganOnBoard } from '@core/models/game.model';

describe('DropOrganHandler', () => {
  let handler: DropOrganHandler;
  let mockGameStore: jest.Mocked<GameStoreService>;

  beforeEach(() => {
    mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    TestBed.configureTestingModule({
      providers: [
        DropOrganHandler,
        { provide: GameStoreService, useValue: mockGameStore }
      ]
    });
    handler = TestBed.inject(DropOrganHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    const roomId = 'room1';
    const player = { player: { id: 'p1' }, board: [] } as unknown as PublicPlayerInfo;

    it('should return error if not my turn/board', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Red } as Card;
      handler.handle(card, roomId, player, false);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Solo puedes poner órganos en tu propio tablero.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play organ directly if no slotColor provided', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Red } as Card;
      handler.handle(card, roomId, player, true);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', undefined);
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should set an error if playing organ color does not match slot color', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Blue } as Card;
      handler.handle(card, roomId, player, true, CardColor.Red);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('El Órgano Cerebro no puede ocupar el hueco Corazón.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should allow multi-color organ to be placed in any slot', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Multi } as Card;
      handler.handle(card, roomId, player, true, CardColor.Red);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', undefined);
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should allow orange (mutant) organ to be placed in any slot', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Orange } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as OrganOnBoard];
      handler.handle(card, roomId, player, true, CardColor.Red);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', { organId: 'o-red', playerId: 'p1' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should allow orange (mutant) organ but pass undefined target if no matching existing organ', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Orange } as Card;
      player.board = []; // No red organ
      handler.handle(card, roomId, player, true, CardColor.Red);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', undefined);
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should allow any organ to be placed in multi-color slot if the organ is orange', () => {
       // While technically multi slot means something else, slotColor can't normally be Multi. We just test the condition checks correctly.
       const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Orange } as Card;
       player.board = [{ id: 'o-multi', color: CardColor.Multi } as OrganOnBoard];
       handler.handle(card, roomId, player, true, CardColor.Multi);
       expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', { organId: 'o-multi', playerId: 'p1' });
    });
  });
});

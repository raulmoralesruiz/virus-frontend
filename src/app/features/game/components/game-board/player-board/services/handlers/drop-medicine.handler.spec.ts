import { TestBed } from '@angular/core/testing';
import { DropMedicineHandler } from './drop-medicine.handler';
import { GameStoreService } from '@core/services/game-store.service';
import { Card, CardColor, CardKind } from '@core/models/card.model';
import { PublicPlayerInfo, OrganOnBoard } from '@core/models/game.model';

describe('DropMedicineHandler', () => {
  let handler: DropMedicineHandler;
  let mockGameStore: jest.Mocked<GameStoreService>;

  beforeEach(() => {
    mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    TestBed.configureTestingModule({
      providers: [
        DropMedicineHandler,
        { provide: GameStoreService, useValue: mockGameStore }
      ]
    });
    handler = TestBed.inject(DropMedicineHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    const roomId = 'room1';
    const player = { player: { id: 'p1' }, board: [] } as unknown as PublicPlayerInfo;

    it('should set an error if there is no organ in the slot', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Red } as Card;
      player.board = []; // No organs
      handler.handle(card, CardColor.Red, roomId, player);
      // 'un Corazón' and 'la Medicina Corazón' depending on functions
      expect(mockGameStore.setClientError).toHaveBeenCalled();
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should set an error if the card color is incompatible with the organ color', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Blue } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as OrganOnBoard];
      handler.handle(card, CardColor.Red, roomId, player);
      expect(mockGameStore.setClientError).toHaveBeenCalled();
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play card if color matches', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Red } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as OrganOnBoard];
      handler.handle(card, CardColor.Red, roomId, player);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', { organId: 'o-red', playerId: 'p1' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should play card if card is multi color', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Multi } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as OrganOnBoard];
      handler.handle(card, CardColor.Red, roomId, player);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', { organId: 'o-red', playerId: 'p1' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should play card if organ is multi color', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Red } as Card;
      player.board = [{ id: 'o-multi', color: CardColor.Multi } as OrganOnBoard];
      handler.handle(card, CardColor.Multi, roomId, player);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(roomId, 'c1', { organId: 'o-multi', playerId: 'p1' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });
  });
});

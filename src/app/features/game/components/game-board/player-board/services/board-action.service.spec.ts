import { TestBed } from '@angular/core/testing';
import { BoardActionService } from './board-action.service';
import { GameStoreService } from '@core/services/game-store.service';
import { CardKind, TreatmentSubtype, CardColor, Card } from '@core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '@core/models/game.model';

describe('BoardActionService', () => {
  let service: BoardActionService;
  let gameStoreServiceMock: jest.Mocked<GameStoreService>;

  beforeEach(() => {
    gameStoreServiceMock = {
      setClientError: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    TestBed.configureTestingModule({
      providers: [
        BoardActionService,
        { provide: GameStoreService, useValue: gameStoreServiceMock }
      ]
    });
    service = TestBed.inject(BoardActionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateContagion', () => {
    it('should return true if isMe is true', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      expect(service.validateContagion(card, true)).toBe(true);
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });

    it('should return false and set error if isMe is false', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      expect(service.validateContagion(card, false)).toBe(false);
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Solo puedes usar Contagio en tu propio turno.');
    });
  });

  describe('validateFailedExperiment', () => {
    let mockCard: Card;
    let mockPlayer: PublicPlayerInfo;

    beforeEach(() => {
      mockCard = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.failedExperiment } as Card;
      mockPlayer = {
        player: { id: 'p1', name: 'P1' },
        board: [],
        connected: true
      };
    });

    it('should return null and set error if organ is not found', () => {
      expect(service.validateFailedExperiment(mockCard, CardColor.Red, mockPlayer)).toBeNull();
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Debes soltar la carta sobre un órgano válido.');
    });

    it('should return null and set error if organ is healthy (not infected, not vaccinated)', () => {
      mockPlayer.board = [{ id: 'o1', color: CardColor.Red, viruses: [], medicines: [], attached: [] } as unknown as OrganOnBoard];
      expect(service.validateFailedExperiment(mockCard, CardColor.Red, mockPlayer)).toBeNull();
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Solo puedes usar Experimento Fallido sobre órganos infectados o vacunados (no inmunes).');
    });

    it('should return null and set error if organ is immune', () => {
      mockPlayer.board = [{ id: 'o1', color: CardColor.Red, viruses: [], medicines: ['m1', 'm2'], attached: [{ kind: CardKind.Medicine }, { kind: CardKind.Medicine }] } as unknown as OrganOnBoard];
      expect(service.validateFailedExperiment(mockCard, CardColor.Red, mockPlayer)).toBeNull();
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Solo puedes usar Experimento Fallido sobre órganos infectados o vacunados (no inmunes).');
    });

    it('should return target if organ is infected', () => {
      mockPlayer.board = [{ id: 'o1', color: CardColor.Red, viruses: ['v1'], medicines: [], attached: [{ kind: CardKind.Virus }] } as unknown as OrganOnBoard];
      const result = service.validateFailedExperiment(mockCard, CardColor.Red, mockPlayer);
      expect(result).toEqual({
        card: mockCard,
        target: { organId: 'o1', playerId: 'p1' }
      });
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });

    it('should return target if organ is vaccinated (not immune)', () => {
      mockPlayer.board = [{ id: 'o1', color: CardColor.Red, viruses: [], medicines: ['m1'], attached: [{ kind: CardKind.Medicine }] } as unknown as OrganOnBoard];
      const result = service.validateFailedExperiment(mockCard, CardColor.Red, mockPlayer);
      expect(result).toEqual({
        card: mockCard,
        target: { organId: 'o1', playerId: 'p1' }
      });
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });
  });

  describe('validateTransplantSelection', () => {
    let mockCard: Card;
    let mockPlayer: PublicPlayerInfo;

    beforeEach(() => {
      mockCard = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card;
      mockPlayer = {
        player: { id: 'p1', name: 'P1' },
        board: [],
        connected: true
      };
    });

    it('should return null and set error if organ is not found', () => {
      expect(service.validateTransplantSelection(mockCard, CardColor.Red, mockPlayer)).toBeNull();
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Debes soltar el trasplante sobre un órgano válido.');
    });

    it('should return firstOrgan if organ is found', () => {
      mockPlayer.board = [{ id: 'o1', color: CardColor.Red, viruses: [], medicines: [] } as unknown as OrganOnBoard];
      const result = service.validateTransplantSelection(mockCard, CardColor.Red, mockPlayer);
      expect(result).toEqual({
        card: mockCard,
        firstOrgan: { organId: 'o1', playerId: 'p1' }
      });
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });
  });

  describe('validateSlotClick', () => {
    it('should return null if transplantState is null', () => {
      expect(service.validateSlotClick(undefined, 'p1', null)).toBeNull();
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });

    it('should return null and set error if organ is undefined and transplantState exists', () => {
      expect(service.validateSlotClick(undefined, 'p1', {} as any)).toBeNull();
      expect(gameStoreServiceMock.setClientError).toHaveBeenCalledWith('Debes seleccionar un órgano válido como segundo objetivo.');
    });

    it('should return object with organId and playerId if both are valid', () => {
      const organ = { id: 'o1', color: CardColor.Red } as OrganOnBoard;
      const result = service.validateSlotClick(organ, 'p2', {} as any);
      expect(result).toEqual({ organId: 'o1', playerId: 'p2' });
      expect(gameStoreServiceMock.setClientError).not.toHaveBeenCalled();
    });
  });
});

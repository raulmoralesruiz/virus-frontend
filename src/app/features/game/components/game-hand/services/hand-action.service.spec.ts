import { TestBed } from '@angular/core/testing';
import { HandActionService } from './hand-action.service';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { HandStrategyResolverService } from './hand-strategy-resolver.service';
import { HandStateService } from './hand-state.service';
import { Card, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicGameState, PlayerState } from '@core/models/game.model';
import { SimplePlayStrategy } from '../strategies/simple-play.strategy';

class MockStrategy extends SimplePlayStrategy {
  canPlay = jest.fn().mockReturnValue(true);
  getTargets = jest.fn().mockReturnValue([{ label: 'test' }]);
  getPlayPayload = jest.fn().mockReturnValue({ test: true });
}

describe('HandActionService', () => {
  let service: HandActionService;
  let gameStoreMock: jest.Mocked<GameStoreService>;
  let apiPlayerMock: jest.Mocked<ApiPlayerService>;
  let resolverMock: jest.Mocked<HandStrategyResolverService>;
  let mockStrategy: MockStrategy;

  beforeEach(() => {
    gameStoreMock = {
      setClientError: jest.fn(),
      playCard: jest.fn()
    } as unknown as jest.Mocked<GameStoreService>;

    apiPlayerMock = {
      player: jest.fn().mockReturnValue({ id: 'me' })
    } as unknown as jest.Mocked<ApiPlayerService>;

    mockStrategy = new MockStrategy();
    resolverMock = {
      resolve: jest.fn().mockReturnValue(mockStrategy)
    } as unknown as jest.Mocked<HandStrategyResolverService>;

    TestBed.configureTestingModule({
      providers: [
        HandActionService,
        HandStateService,
        { provide: GameStoreService, useValue: gameStoreMock },
        { provide: ApiPlayerService, useValue: apiPlayerMock },
        { provide: HandStrategyResolverService, useValue: resolverMock }
      ]
    });

    service = TestBed.inject(HandActionService);
  });

  describe('selectCard', () => {
    it('should clear selection if identifying same card', () => {
      service.selectCard({ id: 'c1' } as Card, null);
      expect(service.selectedCard()?.id).toBe('c1');
      
      service.selectCard({ id: 'c1' } as Card, null);
      expect(service.selectedCard()).toBeNull();
    });

    it('should set selected card and clear other state', () => {
      service.selectCard({ id: 'c1' } as Card, null);
      expect(service.selectedCard()?.id).toBe('c1');
      expect(service.targetOptions()).toEqual([]); // game state was null, early return
    });

    it('should resolve strategy and get targets if game state provided', () => {
      const card = { id: 'c2', kind: CardKind.Organ } as Card;
      const gameState = { players: [] } as unknown as PublicGameState;
      
      service.selectCard(card, gameState);
      
      expect(resolverMock.resolve).toHaveBeenCalledWith(card);
      expect(mockStrategy.getTargets).toHaveBeenCalledWith(gameState, card, 'me');
      expect(service.targetOptions()).toEqual([{ label: 'test' }]);
    });

    it('should initialize special states for contagion', () => {
      const card = { id: 'c3', kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      const gameState = {
        players: [{
          player: { id: 'me' },
          board: [
            { id: 'o1', attached: [{ kind: 'virus' }] },
            { id: 'o2', attached: [{ kind: 'virus' }, { kind: 'virus' }] },
            { id: 'o3', attached: [{ kind: 'medicine' }] }
          ]
        }]
      } as unknown as PublicGameState;
      
      service.selectCard(card, gameState);
      
      expect(service.contagionAssignments().length).toBe(3); // 1 + 2 + 0
      expect(service.contagionAssignments()[0]).toEqual({ fromOrganId: 'o1', toOrganId: '', toPlayerId: '' });
    });

    it('should safely ignore contagion init if player not found', () => {
      const card = { id: 'c4', kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      const gameState = { players: [] } as unknown as PublicGameState; // missing "me"
      
      service.selectCard(card, gameState);
      expect(service.contagionAssignments().length).toBe(0);
    });
  });

  describe('confirmPlay', () => {
    it('should do nothing if no card selected', () => {
      service.confirmPlay('room1');
      expect(gameStoreMock.playCard).not.toHaveBeenCalled();
    });

    it('should do nothing if no room id', () => {
      service.selectCard({ id: 'c1' } as Card, null);
      service.confirmPlay('');
      expect(gameStoreMock.playCard).not.toHaveBeenCalled();
    });

    it('should set error if selection is invalid', () => {
      service.selectCard({ id: 'c1' } as Card, null);
      mockStrategy.canPlay.mockReturnValue(false);
      
      service.confirmPlay('room1');
      
      expect(gameStoreMock.setClientError).toHaveBeenCalledWith('Selección inválida o incompleta');
      expect(gameStoreMock.playCard).not.toHaveBeenCalled();
    });

    it('should get payload from strategy and play card, then clear', () => {
      service.selectCard({ id: 'c1' } as Card, null);
      mockStrategy.canPlay.mockReturnValue(true);
      
      service.confirmPlay('room1');
      
      expect(mockStrategy.getPlayPayload).toHaveBeenCalled();
      expect(gameStoreMock.playCard).toHaveBeenCalledWith('room1', 'c1', { test: true });
      expect(service.selectedCard()).toBeNull(); // cleared
    });
  });

  describe('canConfirmSelection', () => {
    it('should return false if no card is selected', () => {
      // Intentionally reading the signal when state is empty
      expect(service.canConfirmSelection()).toBe(false);
    });
  });
});

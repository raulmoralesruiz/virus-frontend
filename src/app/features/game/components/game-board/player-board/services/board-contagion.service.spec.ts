import { TestBed } from '@angular/core/testing';
import { BoardContagionService } from './board-contagion.service';
import { GameStoreService } from '@core/services/game-store.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Card, CardColor, CardKind } from '@core/models/card.model';
import { OrganOnBoard, PublicGameState, PublicPlayerInfo } from '@core/models/game.model';
import { ContagionState, VirusDropEvent } from '../player-board.models';

describe('BoardContagionService', () => {
  let service: BoardContagionService;
  let mockGameStore: jest.Mocked<GameStoreService>;

  beforeEach(() => {
    mockGameStore = {
      setClientError: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    TestBed.configureTestingModule({
      providers: [
        BoardContagionService,
        { provide: GameStoreService, useValue: mockGameStore }
      ]
    });
    service = TestBed.inject(BoardContagionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateVirusDrop', () => {
    const defaultOrgan: OrganOnBoard = {
      id: 'o-target',
      color: CardColor.Red,
      attached: [],
      viruses: [],
      medicines: []
    } as unknown as OrganOnBoard;

    let defaultGameState: PublicGameState;

    beforeEach(() => {
        defaultGameState = {
            players: [
                {
                    player: { id: 'p1' },
                    board: [
                        {
                            id: 'o-source',
                            color: CardColor.Red,
                            attached: [{ id: 'v1', kind: CardKind.Virus, color: CardColor.Red } as Card]
                        } as unknown as OrganOnBoard
                    ]
                } as PublicPlayerInfo
            ]
        } as PublicGameState;
    });

    const createMockEvent = (fromOrganId: string, virusId: string): CdkDragDrop<any> => ({
      item: { data: { fromOrganId, virusId } }
    } as CdkDragDrop<any>);

    it('should return null if contagionState is null', () => {
      const event = createMockEvent('o-source', 'v1');
      expect(service.validateVirusDrop(event, defaultOrgan, null, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should set error and return null if moving to the same organ', () => {
      const event = createMockEvent('o-target', 'v1');
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes mover el virus al mismo órgano.');
    });

    it('should set error and return null if moving to own organ (isMe is true)', () => {
      const event = createMockEvent('o-source', 'v1');
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, true, 'p1', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes contagiar tus propios órganos.');
    });

    it('should set error and return null if destination organ has attached virus/medicine', () => {
      const event = createMockEvent('o-source', 'v1');
      const organWithAttach = { ...defaultOrgan, attached: [{ kind: CardKind.Virus }] } as OrganOnBoard;
      expect(service.validateVirusDrop(event, organWithAttach, {} as ContagionState, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('El órgano destino no está libre.');
    });

    it('should set error and return null if destination organ has temporary virus', () => {
      const event = createMockEvent('o-source', 'v1');
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => true, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('El órgano destino no está libre.');
    });

    it('should set error and return null if source organ is not found', () => {
      const event = createMockEvent('not-found-organ', 'v1');
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No se encontró el órgano origen.');
    });

    it('should set error and return null if virus is not found in source organ', () => {
      const event = createMockEvent('o-source', 'not-found-virus');
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No se encontró el virus a mover.');
    });

    it('should set error and return null if virus color is incompatible', () => {
      const event = createMockEvent('o-source', 'v1');
      // Change source virus to Blue
      defaultGameState.players[0].board[0]!.attached[0].color = CardColor.Blue;
      expect(service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState)).toBeNull();
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('El virus blue no es compatible con el órgano red.');
    });

    it('should return VirusDropEvent object if all validations pass (matching color)', () => {
      const event = createMockEvent('o-source', 'v1');
      const result = service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState);
      expect(result).toEqual({
        fromOrganId: 'o-source',
        toOrganId: 'o-target',
        toPlayerId: 'p2',
        virus: { id: 'v1', kind: CardKind.Virus, color: CardColor.Red }
      });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should return VirusDropEvent object if all validations pass (multi color virus)', () => {
      const event = createMockEvent('o-source', 'v1');
      defaultGameState.players[0].board[0]!.attached[0].color = CardColor.Multi;
      const result = service.validateVirusDrop(event, defaultOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState);
      expect(result).toBeTruthy();
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should return VirusDropEvent object if all validations pass (multi color organ)', () => {
        const event = createMockEvent('o-source', 'v1');
        const multiOrgan = { ...defaultOrgan, color: CardColor.Multi };
        const result = service.validateVirusDrop(event, multiOrgan, {} as ContagionState, false, 'p2', () => false, defaultGameState);
        expect(result).toBeTruthy();
        expect(mockGameStore.setClientError).not.toHaveBeenCalled();
      });
  });
});

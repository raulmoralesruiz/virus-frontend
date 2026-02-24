import { TestBed } from '@angular/core/testing';
import { PlayerBoardDropService } from './player-board-drop.service';
import { GameStoreService } from '@core/services/game-store.service';
import { DropOrganHandler } from './handlers/drop-organ.handler';
import { DropMedicineHandler } from './handlers/drop-medicine.handler';
import { DropTreatmentHandler } from './handlers/drop-treatment.handler';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicPlayerInfo } from '@core/models/game.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

describe('PlayerBoardDropService', () => {
  let service: PlayerBoardDropService;
  let mockGameStore: jest.Mocked<GameStoreService>;
  let mockDropOrgan: jest.Mocked<DropOrganHandler>;
  let mockDropMedicine: jest.Mocked<DropMedicineHandler>;
  let mockDropTreatment: jest.Mocked<DropTreatmentHandler>;

  beforeEach(() => {
    mockGameStore = { setClientError: jest.fn() } as unknown as jest.Mocked<GameStoreService>;
    mockDropOrgan = { handle: jest.fn() } as unknown as jest.Mocked<DropOrganHandler>;
    mockDropMedicine = { handle: jest.fn() } as unknown as jest.Mocked<DropMedicineHandler>;
    mockDropTreatment = { handle: jest.fn(), handleBoard: jest.fn() } as unknown as jest.Mocked<DropTreatmentHandler>;

    TestBed.configureTestingModule({
      providers: [
        PlayerBoardDropService,
        { provide: GameStoreService, useValue: mockGameStore },
        { provide: DropOrganHandler, useValue: mockDropOrgan },
        { provide: DropMedicineHandler, useValue: mockDropMedicine },
        { provide: DropTreatmentHandler, useValue: mockDropTreatment },
      ]
    });

    service = TestBed.inject(PlayerBoardDropService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleBoardDrop', () => {
    const mockPlayer = { player: { id: 'p1' } } as PublicPlayerInfo;
    const roomId = 'room1';

    it('should do nothing if roomId is empty', () => {
      const event = { item: { data: { kind: CardKind.Organ } } } as CdkDragDrop<any>;
      service.handleBoardDrop(event, '', mockPlayer, true);
      expect(mockDropOrgan.handle).not.toHaveBeenCalled();
    });

    it('should do nothing if card is undefined', () => {
      const event = { item: { data: undefined } } as CdkDragDrop<any>;
      service.handleBoardDrop(event, roomId, mockPlayer, true);
      expect(mockDropOrgan.handle).not.toHaveBeenCalled();
    });

    it('should handle Organ card using DropOrganHandler', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Red } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleBoardDrop(event, roomId, mockPlayer, true);
      expect(mockDropOrgan.handle).toHaveBeenCalledWith(card, roomId, mockPlayer, true);
    });

    it('should handle Treatment card using DropTreatmentHandler.handleBoard', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Transplant } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleBoardDrop(event, roomId, mockPlayer, true);
      expect(mockDropTreatment.handleBoard).toHaveBeenCalledWith(card, roomId, mockPlayer, true);
    });

    it('should set an error for unhandled card types on board', () => {
      const card = { id: 'c1', kind: CardKind.Virus, color: CardColor.Red } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleBoardDrop(event, roomId, mockPlayer, true);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith(`No puedes soltar virus en el tablero general.`);
    });
  });

  describe('handleSlotDrop', () => {
    const mockPlayer = { player: { id: 'p1' } } as PublicPlayerInfo;
    const roomId = 'room1';
    const slotColor = CardColor.Red;

    it('should do nothing if roomId is empty', () => {
      const event = { item: { data: { kind: CardKind.Organ } } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, '', mockPlayer, true, slotColor);
      expect(mockDropOrgan.handle).not.toHaveBeenCalled();
    });

    it('should handle Organ card using DropOrganHandler', () => {
      const card = { id: 'c1', kind: CardKind.Organ, color: CardColor.Red } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, roomId, mockPlayer, true, slotColor);
      expect(mockDropOrgan.handle).toHaveBeenCalledWith(card, roomId, mockPlayer, true, slotColor);
    });

    it('should handle Medicine card using DropMedicineHandler', () => {
      const card = { id: 'c1', kind: CardKind.Medicine, color: CardColor.Red } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, roomId, mockPlayer, true, slotColor);
      expect(mockDropMedicine.handle).toHaveBeenCalledWith(card, slotColor, roomId, mockPlayer);
    });

    it('should handle Virus card using DropMedicineHandler', () => {
      const card = { id: 'c1', kind: CardKind.Virus, color: CardColor.Red } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, roomId, mockPlayer, true, slotColor);
      expect(mockDropMedicine.handle).toHaveBeenCalledWith(card, slotColor, roomId, mockPlayer);
    });

    it('should handle Treatment card using DropTreatmentHandler.handle', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, roomId, mockPlayer, true, slotColor);
      expect(mockDropTreatment.handle).toHaveBeenCalledWith(card, slotColor, roomId, mockPlayer, true);
    });

    it('should set an error for unhandled card types on slot', () => {
      const card = { id: 'c1', kind: 'UnknownKind' as CardKind } as Card;
      const event = { item: { data: card } } as CdkDragDrop<any>;
      service.handleSlotDrop(event, roomId, mockPlayer, true, slotColor);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith(`Tipo de carta no manejado por drag-and-drop: UnknownKind`);
    });
  });
});

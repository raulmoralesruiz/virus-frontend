import { TestBed } from '@angular/core/testing';
import { DropTreatmentHandler } from './drop-treatment.handler';
import { DropCommonTreatmentHandler } from './drop-common-treatment.handler';
import { GameStoreService } from '@core/services/game-store.service';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicPlayerInfo } from '@core/models/game.model';

describe('DropTreatmentHandler', () => {
  let handler: DropTreatmentHandler;
  let mockGameStore: jest.Mocked<GameStoreService>;
  let mockCommonHandler: jest.Mocked<DropCommonTreatmentHandler>;

  beforeEach(() => {
    mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    mockCommonHandler = {
      playOrganThief: jest.fn(),
      playColorThief: jest.fn(),
      playMedicalError: jest.fn(),
      playTrickOrTreat: jest.fn(),
    } as unknown as jest.Mocked<DropCommonTreatmentHandler>;

    TestBed.configureTestingModule({
      providers: [
        DropTreatmentHandler,
        { provide: GameStoreService, useValue: mockGameStore },
        { provide: DropCommonTreatmentHandler, useValue: mockCommonHandler },
      ]
    });
    handler = TestBed.inject(DropTreatmentHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const player = { player: { id: 'p1' } } as PublicPlayerInfo;
  const rid = 'room1';
  const slotColor = CardColor.Red;

  describe('handle', () => {
    it('should delegate OrganThief to common handler', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      handler.handle(card, slotColor, rid, player, true);
      expect(mockCommonHandler.playOrganThief).toHaveBeenCalledWith(card, slotColor, rid, player, true);
    });

    it('should delegate colorThief checks to common handler', () => {
      const cards = [
        { subtype: TreatmentSubtype.colorThiefRed, targetColor: CardColor.Red },
        { subtype: TreatmentSubtype.colorThiefGreen, targetColor: CardColor.Green },
        { subtype: TreatmentSubtype.colorThiefBlue, targetColor: CardColor.Blue },
        { subtype: TreatmentSubtype.colorThiefYellow, targetColor: CardColor.Yellow },
      ];

      for (const { subtype, targetColor } of cards) {
        const card = { id: 'c1', kind: CardKind.Treatment, subtype } as Card;
        handler.handle(card, slotColor, rid, player, true);
        expect(mockCommonHandler.playColorThief).toHaveBeenCalledWith(card, slotColor, targetColor, rid, player, true);
      }
    });

    it('should delegate MedicalError to common handler', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
      handler.handle(card, slotColor, rid, player, true);
      expect(mockCommonHandler.playMedicalError).toHaveBeenCalledWith(card, rid, player);
    });

    it('should process Gloves directly', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Gloves } as Card;
      handler.handle(card, slotColor, rid, player, true);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1');
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Has jugado Guantes de Látex.');
    });

    it('should delegate TrickOrTreat to common handler', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
      handler.handle(card, slotColor, rid, player, true);
      expect(mockCommonHandler.playTrickOrTreat).toHaveBeenCalledWith(card, rid, player);
    });

    it('should ignore mode activators (component intercepts them)', () => {
      const cards = [
        { subtype: TreatmentSubtype.Contagion },
        { subtype: TreatmentSubtype.Transplant },
        { subtype: TreatmentSubtype.AlienTransplant },
        { subtype: TreatmentSubtype.failedExperiment },
      ];
      for (const { subtype } of cards) {
        const card = { id: 'c1', kind: CardKind.Treatment, subtype } as Card;
        handler.handle(card, slotColor, rid, player, true);
        expect(mockGameStore.playCard).not.toHaveBeenCalled();
        expect(mockGameStore.setClientError).not.toHaveBeenCalled();
      }
    });

    it('should set an error for unknown treatment', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: 'UNKNOWN' as any } as Card;
      handler.handle(card, slotColor, rid, player, true);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Tratamiento UNKNOWN aún no implementado por drag-and-drop');
    });
  });

  describe('handleBoard', () => {
    it('should process Gloves directly', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Gloves } as Card;
      handler.handleBoard(card, rid, player, true);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1');
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Has jugado Guantes de Látex.');
    });

    it('should delegate MedicalError to common handler', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
      handler.handleBoard(card, rid, player, true);
      expect(mockCommonHandler.playMedicalError).toHaveBeenCalledWith(card, rid, player);
    });

    it('should delegate TrickOrTreat to common handler', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
      handler.handleBoard(card, rid, player, true);
      expect(mockCommonHandler.playTrickOrTreat).toHaveBeenCalledWith(card, rid, player);
    });

    it('should ignore mode activators on board drop', () => {
      const cards = [
        { subtype: TreatmentSubtype.BodySwap },
        { subtype: TreatmentSubtype.Apparition },
        { subtype: TreatmentSubtype.Contagion },
      ];
      for (const { subtype } of cards) {
        const card = { id: 'c1', kind: CardKind.Treatment, subtype } as Card;
        handler.handleBoard(card, rid, player, true);
        expect(mockGameStore.playCard).not.toHaveBeenCalled();
        expect(mockGameStore.setClientError).not.toHaveBeenCalled();
      }
    });

    it('should set an error for unexpected/unknown treatment on board', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      handler.handleBoard(card, rid, player, true);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Tratamiento organThief no válido en el tablero general.');
    });
  });
});

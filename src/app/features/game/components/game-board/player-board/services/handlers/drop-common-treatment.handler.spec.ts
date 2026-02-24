import { TestBed } from '@angular/core/testing';
import { DropCommonTreatmentHandler } from './drop-common-treatment.handler';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicPlayerInfo, Player } from '@core/models/game.model';

describe('DropCommonTreatmentHandler', () => {
  let handler: DropCommonTreatmentHandler;
  let mockGameStore: jest.Mocked<GameStoreService>;
  let mockApiPlayer: jest.Mocked<ApiPlayerService>;

  beforeEach(() => {
    mockGameStore = {
      setClientError: jest.fn(),
      playCard: jest.fn(),
    } as unknown as jest.Mocked<GameStoreService>;

    mockApiPlayer = {
      player: jest.fn().mockReturnValue({ id: 'me_id' } as Player),
    } as unknown as jest.Mocked<ApiPlayerService>;

    TestBed.configureTestingModule({
      providers: [
        DropCommonTreatmentHandler,
        { provide: GameStoreService, useValue: mockGameStore },
        { provide: ApiPlayerService, useValue: mockApiPlayer },
      ]
    });
    handler = TestBed.inject(DropCommonTreatmentHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const player = { player: { id: 'target_id' }, board: [] } as unknown as PublicPlayerInfo;
  const mePlayer = { player: { id: 'me_id' }, board: [] } as unknown as PublicPlayerInfo;
  const rid = 'room1';

  describe('playOrganThief', () => {
    it('should set error if stealing from oneself (isMe is true)', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      handler.playOrganThief(card, CardColor.Red, rid, mePlayer, true);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes robarte a ti mismo.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should set error if target organ is missing', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      player.board = [];
      handler.playOrganThief(card, CardColor.Red, rid, player, false);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No hay órgano en hueco red para aplicar treatment');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play card if valid', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as any];
      handler.playOrganThief(card, CardColor.Red, rid, player, false);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1', { organId: 'o-red', playerId: 'target_id' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });
  });

  describe('playColorThief', () => {
    it('should set error if stealing from oneself (isMe is true)', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as Card;
      handler.playColorThief(card, CardColor.Red, CardColor.Red, rid, mePlayer, true);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes robarte a ti mismo.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should set error if target organ is missing', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as Card;
      player.board = [];
      handler.playColorThief(card, CardColor.Red, CardColor.Red, rid, player, false);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No hay órgano en hueco red para aplicar treatment');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should set error if target organ color does not match required color', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Multi } as any]; 
      handler.playColorThief(card, CardColor.Multi, CardColor.Red, rid, player, false);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No coincide el color del órgano');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play card if valid', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.colorThiefRed } as Card;
      player.board = [{ id: 'o-red', color: CardColor.Red } as any];
      handler.playColorThief(card, CardColor.Red, CardColor.Red, rid, player, false);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1', { organId: 'o-red', playerId: 'target_id' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });
  });

  describe('playMedicalError', () => {
    it('should set error if targeting oneself', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
      handler.playMedicalError(card, rid, mePlayer);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes jugar Error Médico sobre ti mismo.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play card if valid', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
      handler.playMedicalError(card, rid, player);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1', { playerId: 'target_id' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should do nothing if me is undefined', () => {
        mockApiPlayer.player.mockReturnValue(null);
        const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
        handler.playMedicalError(card, rid, player);
        expect(mockGameStore.playCard).not.toHaveBeenCalled();
        expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });
  });

  describe('playTrickOrTreat', () => {
    it('should set error if targeting oneself', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
      handler.playTrickOrTreat(card, rid, mePlayer);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('No puedes jugar Truco o Trato sobre ti mismo.');
      expect(mockGameStore.playCard).not.toHaveBeenCalled();
    });

    it('should play card if valid', () => {
      const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
      handler.playTrickOrTreat(card, rid, player);
      expect(mockGameStore.playCard).toHaveBeenCalledWith(rid, 'c1', { playerId: 'target_id' });
      expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });

    it('should do nothing if me is undefined', () => {
        mockApiPlayer.player.mockReturnValue(null);
        const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
        handler.playTrickOrTreat(card, rid, player);
        expect(mockGameStore.playCard).not.toHaveBeenCalled();
        expect(mockGameStore.setClientError).not.toHaveBeenCalled();
    });
  });
});

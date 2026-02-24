import { TestBed } from '@angular/core/testing';
import { HandDiscardService } from './hand-discard.service';
import { GameStoreService } from '@core/services/game-store.service';
import { Card } from '@core/models/card.model';

describe('HandDiscardService', () => {
  let service: HandDiscardService;
  let gameStoreMock: jest.Mocked<GameStoreService>;

  beforeEach(() => {
    gameStoreMock = {
      discardCards: jest.fn()
    } as unknown as jest.Mocked<GameStoreService>;

    TestBed.configureTestingModule({
      providers: [
        HandDiscardService,
        { provide: GameStoreService, useValue: gameStoreMock }
      ]
    });

    service = TestBed.inject(HandDiscardService);
  });

  describe('toggleSelection', () => {
    it('should ignore selection if not my turn', () => {
      service.toggleSelection(1, false);
      expect(service.isSelected(1)).toBe(false);
      expect(service.selectedDiscardCount()).toBe(0);
    });

    it('should toggle selection if my turn', () => {
      service.toggleSelection(1, true);
      expect(service.isSelected(1)).toBe(true);
      expect(service.selectedDiscardCount()).toBe(1);

      service.toggleSelection(1, true);
      expect(service.isSelected(1)).toBe(false);
      expect(service.selectedDiscardCount()).toBe(0);
    });
  });

  describe('discard', () => {
    let mockHand: Card[];

    beforeEach(() => {
      mockHand = [
        { id: 'c0' } as Card,
        { id: 'c1' } as Card,
        { id: 'c2' } as Card,
      ];
    });

    it('should not discard if no roomId provided', () => {
      service.toggleSelection(1, true);
      service.discard(null, mockHand);
      expect(gameStoreMock.discardCards).not.toHaveBeenCalled();
    });

    it('should not discard if no selection', () => {
      service.discard('r1', mockHand);
      expect(gameStoreMock.discardCards).not.toHaveBeenCalled();
    });

    it('should not discard if selection maps to undefined cards', () => {
      service.toggleSelection(5, true); // index 5 doesn't exist in mockHand
      service.discard('r1', mockHand);
      expect(gameStoreMock.discardCards).not.toHaveBeenCalled();
    });

    it('should discard selected cards and reset', () => {
      service.toggleSelection(0, true);
      service.toggleSelection(2, true);
      
      service.discard('r1', mockHand);
      
      expect(gameStoreMock.discardCards).toHaveBeenCalledWith('r1', ['c0', 'c2']);
      expect(service.selectedDiscardCount()).toBe(0); // Should be reset
    });
  });

  describe('reset', () => {
    it('should reset selections', () => {
      service.toggleSelection(0, true);
      service.reset();
      expect(service.selectedDiscardCount()).toBe(0);
    });
  });
});

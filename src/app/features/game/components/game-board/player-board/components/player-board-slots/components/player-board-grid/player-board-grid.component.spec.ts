import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerBoardGridComponent } from './player-board-grid.component';
import { GameStoreService } from '@core/services/game-store.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { PlayerBoardDropService } from '../../../../services/player-board-drop.service';
import { BoardContagionService } from '../../../../services/board-contagion.service';
import { BoardActionService } from '../../../../services/board-action.service';
import { BoardDragPredicates } from '../../../../logic/board-drag-predicates';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { PublicPlayerInfo, Player } from '@core/models/game.model';
import { CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

describe('PlayerBoardGridComponent', () => {
  let component: PlayerBoardGridComponent;
  let fixture: ComponentFixture<PlayerBoardGridComponent>;

  let mockGameStore: any;
  let mockApiPlayer: any;
  let mockDropService: any;
  let mockContagionService: any;
  let mockActionService: any;
  let mockPredicates: any;

  beforeEach(() => {
    mockGameStore = { setClientError: jest.fn() };
    mockApiPlayer = { player: jest.fn().mockReturnValue({ id: 'me' } as Player) };
    mockDropService = { handleSlotDrop: jest.fn() };
    mockContagionService = { validateVirusDrop: jest.fn() };
    mockActionService = { 
       validateTransplantSelection: jest.fn(),
       validateFailedExperiment: jest.fn(),
       validateContagion: jest.fn(),
       validateSlotClick: jest.fn()
    };
    mockPredicates = { checkSlotEnter: jest.fn() };

    TestBed.configureTestingModule({
      imports: [PlayerBoardGridComponent],
      providers: [
        { provide: GameStoreService, useValue: mockGameStore },
        { provide: ApiPlayerService, useValue: mockApiPlayer },
        { provide: PlayerBoardDropService, useValue: mockDropService },
        { provide: BoardContagionService, useValue: mockContagionService },
        { provide: BoardActionService, useValue: mockActionService },
        { provide: BoardDragPredicates, useValue: mockPredicates }
      ]
    });

    fixture = TestBed.createComponent(PlayerBoardGridComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('player', { player: { id: 'p1' }, board: [] } as unknown as PublicPlayerInfo);
    fixture.componentRef.setInput('isMe', true);
    fixture.componentRef.setInput('allSlotIds', ['slot-1', 'slot-2']);
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('gameState', { cardsRemaining: 10 });
    fixture.componentRef.setInput('getTemporaryVirusesForOrgan', jest.fn());
    fixture.componentRef.setInput('hasTemporaryVirus', jest.fn());
  });

  describe('slotEnterPredicate', () => {
    it('should call predicates service', () => {
      component.slotEnterPredicate({} as CdkDrag, {} as CdkDropList);
      expect(mockPredicates.checkSlotEnter).toHaveBeenCalled();
    });
  });

  describe('onDrop', () => {
    it('should set error if contagion active but no organ provided', () => {
      fixture.componentRef.setInput('contagionState', { cardId: 'c1', color: CardColor.Red });
      component.onDrop({} as CdkDragDrop<any>, CardColor.Red, null);
      expect(mockGameStore.setClientError).toHaveBeenCalledWith('Debes contagiar un órgano válido.');
    });

    it('should call onVirusDrop if contagion is active and organ is valid', () => {
       jest.spyOn(component, 'onVirusDrop').mockImplementation();
       fixture.componentRef.setInput('contagionState', { cardId: 'c1', color: CardColor.Red });
       const organ = { id: 'o1', color: CardColor.Red } as any;
       component.onDrop({} as CdkDragDrop<any>, CardColor.Red, organ);
       expect(component.onVirusDrop).toHaveBeenCalledWith(expect.anything(), organ);
    });

    it('should call onSlotDrop if contagion is not active', () => {
        jest.spyOn(component, 'onSlotDrop').mockImplementation();
        component.onDrop({} as CdkDragDrop<any>, CardColor.Red);
        expect(component.onSlotDrop).toHaveBeenCalledWith(expect.anything(), CardColor.Red);
    });
  });

  describe('onSlotDrop', () => {
    const createEvent = (cardKind: CardKind, subtype?: TreatmentSubtype) => ({ item: { data: { id: 'c1', kind: cardKind, subtype } } }) as CdkDragDrop<any>;

    it('should early return if roomId is not set', () => {
        fixture.componentRef.setInput('roomId', '');
        component.onSlotDrop(createEvent(CardKind.Organ), CardColor.Red);
        expect(mockDropService.handleSlotDrop).not.toHaveBeenCalled();
    });

    it('should early return if apiPlayer player is null', () => {
        mockApiPlayer.player.mockReturnValue(null);
        component.onSlotDrop(createEvent(CardKind.Organ), CardColor.Red);
        expect(mockDropService.handleSlotDrop).not.toHaveBeenCalled();
    });

    it('should startTransplant if validateTransplantSelection returns event (Transplant)', () => {
       const res = { cardId: 'c1' };
       mockActionService.validateTransplantSelection.mockReturnValue(res);
       jest.spyOn(component.startTransplant, 'emit');
       
       component.onSlotDrop(createEvent(CardKind.Treatment, TreatmentSubtype.Transplant), CardColor.Red);
       expect(component.startTransplant.emit).toHaveBeenCalledWith(res);
       expect(mockDropService.handleSlotDrop).not.toHaveBeenCalled();
    });

    it('should not emit startTransplant if invalid', () => {
        mockActionService.validateTransplantSelection.mockReturnValue(null);
        jest.spyOn(component.startTransplant, 'emit');
        component.onSlotDrop(createEvent(CardKind.Treatment, TreatmentSubtype.AlienTransplant), CardColor.Red);
        expect(component.startTransplant.emit).not.toHaveBeenCalled();
        expect(mockDropService.handleSlotDrop).not.toHaveBeenCalled(); // Still returns early
    });

    it('should startFailedExperiment if valid', () => {
        const res = { cardId: 'c1' };
        mockActionService.validateFailedExperiment.mockReturnValue(res);
        jest.spyOn(component.startFailedExperiment, 'emit');
        component.onSlotDrop(createEvent(CardKind.Treatment, TreatmentSubtype.failedExperiment), CardColor.Red);
        expect(component.startFailedExperiment.emit).toHaveBeenCalledWith(res);
    });

    it('should startContagion if valid', () => {
        mockActionService.validateContagion.mockReturnValue(true);
        jest.spyOn(component.startContagion, 'emit');
        const card = { id: 'c1', kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
        component.onSlotDrop({ item: { data: card } } as CdkDragDrop<any>, CardColor.Red);
        expect(component.startContagion.emit).toHaveBeenCalledWith({ card });
    });

    it('should call handleSlotDrop for standard cards', () => {
        const event = createEvent(CardKind.Organ);
        component.onSlotDrop(event, CardColor.Red);
        expect(mockDropService.handleSlotDrop).toHaveBeenCalledWith(event, 'room-1', component.player(), true, CardColor.Red);
    });
  });

  describe('onVirusDrop', () => {
    it('should do nothing if contagionState is null', () => {
        fixture.componentRef.setInput('contagionState', null);
        jest.spyOn(component.virusMoved, 'emit');
        component.onVirusDrop({} as CdkDragDrop<any>, {} as any);
        expect(component.virusMoved.emit).not.toHaveBeenCalled();
    });

    it('should emit virusMoved if contagionService validates', () => {
        const state = { color: CardColor.Red };
        fixture.componentRef.setInput('contagionState', state);
        const res = { sourceOrganId: 'so', targetOrganId: 'to' };
        mockContagionService.validateVirusDrop.mockReturnValue(res);
        jest.spyOn(component.virusMoved, 'emit');
        
        component.onVirusDrop({} as CdkDragDrop<any>, {} as any);
        expect(component.virusMoved.emit).toHaveBeenCalledWith(res);
        expect(mockContagionService.validateVirusDrop).toHaveBeenCalled();
    });
  });

  describe('onSlotClick', () => {
    it('should emit finishTransplant if valid', () => {
       const res = { organId: 'o1', playerId: 'p1' };
       mockActionService.validateSlotClick.mockReturnValue(res);
       jest.spyOn(component.finishTransplant, 'emit');
       component.onSlotClick({} as any, 'p1');
       expect(component.finishTransplant.emit).toHaveBeenCalledWith(res);
    });
  });

  describe('getConnectedIdsForSlot', () => {
     it('should return handList-me and others avoiding my own slot', () => {
         const ids = component.getConnectedIdsForSlot(CardColor.Red);
         expect(ids).toContain('handList-me');
         expect(ids).toContain('slot-1');
         expect(ids).toContain('slot-2');
         expect(ids).not.toContain('slot-p1-red'); // Filter logic
     });

     it('should not include handList-me if apiPlayer is null', () => {
         mockApiPlayer.player.mockReturnValue(null);
         const ids = component.getConnectedIdsForSlot(CardColor.Red);
         expect(ids).not.toContain('handList-me');
         expect(ids).toContain('slot-1');
     });
  });
});

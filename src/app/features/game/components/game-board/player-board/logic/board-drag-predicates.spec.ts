import { TestBed } from '@angular/core/testing';
import { BoardDragPredicates } from './board-drag-predicates';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { OrganOnBoard, PublicPlayerInfo } from '@core/models/game.model';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

describe('BoardDragPredicates', () => {
  let service: BoardDragPredicates;
  let mockApiPlayer: jest.Mocked<ApiPlayerService>;

  beforeEach(() => {
    mockApiPlayer = {
      player: jest.fn().mockReturnValue({ id: 'me' })
    } as unknown as jest.Mocked<ApiPlayerService>;

    TestBed.configureTestingModule({
      providers: [
        BoardDragPredicates,
        { provide: ApiPlayerService, useValue: mockApiPlayer }
      ]
    });
    service = TestBed.inject(BoardDragPredicates);
  });

  const playerInfo: PublicPlayerInfo = { player: { id: 'p1' }, board: [] } as unknown as PublicPlayerInfo;

  describe('isCardValidForBoard', () => {
    it('should be valid for organs except orange on my board', () => {
      const redOrgan = { kind: CardKind.Organ, color: CardColor.Red } as Card;
      expect(service.isCardValidForBoard(redOrgan, true)).toBe(true);
      expect(service.isCardValidForBoard(redOrgan, false)).toBe(false);

      const orangeOrgan = { kind: CardKind.Organ, color: CardColor.Orange } as Card;
      expect(service.isCardValidForBoard(orangeOrgan, true)).toBe(false);
    });

    it('should be valid for universal treatments', () => {
      const g = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Gloves } as Card;
      const b = { kind: CardKind.Treatment, subtype: TreatmentSubtype.BodySwap } as Card;
      const a = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Apparition } as Card;
      expect(service.isCardValidForBoard(g, true)).toBe(true);
      expect(service.isCardValidForBoard(b, false)).toBe(true);
      expect(service.isCardValidForBoard(a, true)).toBe(true);
    });

    it('should be valid for attacks only on rivals', () => {
      const err = { kind: CardKind.Treatment, subtype: TreatmentSubtype.MedicalError } as Card;
      const trick = { kind: CardKind.Treatment, subtype: TreatmentSubtype.trickOrTreat } as Card;
      
      expect(service.isCardValidForBoard(err, false)).toBe(true); // rival board
      expect(service.isCardValidForBoard(err, true)).toBe(false); // my board
      expect(service.isCardValidForBoard(trick, false)).toBe(true);
      expect(service.isCardValidForBoard(trick, true)).toBe(false);

      mockApiPlayer.player.mockReturnValue(null);
      expect(service.isCardValidForBoard(err, false)).toBe(false); // no me player
    });

    it('should be valid for Contagion only on my board', () => {
      const cont = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion } as Card;
      expect(service.isCardValidForBoard(cont, true)).toBe(true);
      expect(service.isCardValidForBoard(cont, false)).toBe(false);
    });

    it('should return false for unknown treatments', () => {
      const unknown = { kind: CardKind.Treatment, subtype: 'unknown' as any } as Card;
      expect(service.isCardValidForBoard(unknown, true)).toBe(false);
    });

    it('should return false for medicine or virus directly to board', () => {
      const med = { kind: CardKind.Medicine, color: CardColor.Red } as Card;
      const vir = { kind: CardKind.Virus, color: CardColor.Red } as Card;
      expect(service.isCardValidForBoard(med, true)).toBe(false);
      expect(service.isCardValidForBoard(vir, false)).toBe(false);
    });
  });

  describe('checkBoardEnter', () => {
    it('should return false if drag data is undefined', () => {
      const drag = { data: undefined } as unknown as CdkDrag;
      expect(service.checkBoardEnter(drag, {} as CdkDropList, playerInfo, true)).toBe(false);
    });

    it('should return false if drag data has virusId (dragging a virus from an organ)', () => {
      const drag = { data: { virusId: 'v1' } } as unknown as CdkDrag;
      expect(service.checkBoardEnter(drag, {} as CdkDropList, playerInfo, true)).toBe(false);
    });

    it('should call isCardValidForBoard for cards', () => {
      const card = { kind: CardKind.Organ, color: CardColor.Red } as Card;
      const drag = { data: card } as unknown as CdkDrag;
      const spy = jest.spyOn(service, 'isCardValidForBoard');
      expect(service.checkBoardEnter(drag, {} as CdkDropList, playerInfo, true)).toBe(true);
      expect(spy).toHaveBeenCalledWith(card, true, 'p1');
    });
  });

  describe('checkSlotEnter', () => {
    it('should return false if drag data is missing', () => {
      const drag = { data: undefined } as unknown as CdkDrag;
      expect(service.checkSlotEnter(drag, { data: [] } as unknown as CdkDropList, playerInfo, true)).toBe(false);
    });

    it('should return false if drop data (organ) is missing', () => {
      const drag = { data: { kind: CardKind.Organ, color: CardColor.Red } as Card } as unknown as CdkDrag;
      expect(service.checkSlotEnter(drag, { data: [undefined] } as unknown as CdkDropList, playerInfo, true)).toBe(false);
    });

    describe('Virus dragging (Contagion)', () => {
       it('should return true if no virus card provided in data but virusId exists', () => {
         const drag = { data: { virusId: 'v1' } } as unknown as CdkDrag;
         const drop = { data: [{ color: CardColor.Red } as OrganOnBoard] } as unknown as CdkDropList;
         expect(service.checkSlotEnter(drag, drop, playerInfo, true)).toBe(true);
       });

       it('should check colors for virus dragging if virus card is provided', () => {
         const dragMatch = { data: { virusId: 'v1', virus: { color: CardColor.Red } } } as unknown as CdkDrag;
         const dragMismatch = { data: { virusId: 'v1', virus: { color: CardColor.Blue } } } as unknown as CdkDrag;
         const dragMulti = { data: { virusId: 'v1', virus: { color: CardColor.Multi } } } as unknown as CdkDrag;
         const dropRed = { data: [{ color: CardColor.Red } as OrganOnBoard] } as unknown as CdkDropList;
         const dropMulti = { data: [{ color: CardColor.Multi } as OrganOnBoard] } as unknown as CdkDropList;

         expect(service.checkSlotEnter(dragMatch, dropRed, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(dragMismatch, dropRed, playerInfo, true)).toBe(false);
         expect(service.checkSlotEnter(dragMulti, dropRed, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(dragMismatch, dropMulti, playerInfo, true)).toBe(true);
       });
    });

    describe('Organ cards', () => {
      it('should return true for orange organ on my board', () => {
         const drag = { data: { kind: CardKind.Organ, color: CardColor.Orange } } as unknown as CdkDrag;
         const drop = { data: [{ color: CardColor.Red } as OrganOnBoard] } as unknown as CdkDropList;
         
         expect(service.checkSlotEnter(drag, drop, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(drag, drop, playerInfo, false)).toBe(false);
      });

      it('should return false for other organs', () => {
        const drag = { data: { kind: CardKind.Organ, color: CardColor.Red } } as unknown as CdkDrag;
        const drop = { data: [{ color: CardColor.Red } as OrganOnBoard] } as unknown as CdkDropList;
        expect(service.checkSlotEnter(drag, drop, playerInfo, true)).toBe(false);
      });
    });

    describe('Medicine/Virus cards', () => {
       it('should match colors or multi', () => {
         const dragMedRed = { data: { kind: CardKind.Medicine, color: CardColor.Red } } as unknown as CdkDrag;
         const dragMedBlue = { data: { kind: CardKind.Medicine, color: CardColor.Blue } } as unknown as CdkDrag;
         const dragVirMulti = { data: { kind: CardKind.Virus, color: CardColor.Multi } } as unknown as CdkDrag;
         
         const dropRed = { data: [{ color: CardColor.Red } as OrganOnBoard] } as unknown as CdkDropList;
         const dropMulti = { data: [{ color: CardColor.Multi } as OrganOnBoard] } as unknown as CdkDropList;

         expect(service.checkSlotEnter(dragMedRed, dropRed, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(dragMedBlue, dropRed, playerInfo, true)).toBe(false);
         expect(service.checkSlotEnter(dragVirMulti, dropRed, playerInfo, false)).toBe(true);
         expect(service.checkSlotEnter(dragMedRed, dropMulti, playerInfo, true)).toBe(true);
       });
    });

    describe('Treatment cards', () => {
       const createDrag = (subtype: string) => ({ data: { kind: CardKind.Treatment, subtype } }) as unknown as CdkDrag;
       const createOrgan = (opts: Partial<OrganOnBoard> = {}) => ({ data: [{ color: CardColor.Red, attached: [], ...opts }] }) as unknown as CdkDropList;
       let immuneOrgan: any;
       let infectedOrgan: any;
       let vaccinatedOrgan: any;

       beforeEach(() => {
          immuneOrgan = createOrgan({ attached: [{ kind: CardKind.Medicine }, { kind: CardKind.Medicine }] });
          infectedOrgan = createOrgan({ attached: [{ kind: CardKind.Virus }] });
          vaccinatedOrgan = createOrgan({ attached: [{ kind: CardKind.Medicine }] });
       });

       it('should handle OrganThief', () => {
         const drag = createDrag(TreatmentSubtype.OrganThief);
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, false)).toBe(true); // not me
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, true)).toBe(false); // is me
         expect(service.checkSlotEnter(drag, immuneOrgan, playerInfo, false)).toBe(false); // is immune
       });

       it('should handle Transplant', () => {
         const drag = createDrag(TreatmentSubtype.Transplant);
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, true)).toBe(true); 
         expect(service.checkSlotEnter(drag, immuneOrgan, playerInfo, true)).toBe(false);
       });

       it('should handle AlienTransplant', () => {
         const drag = createDrag(TreatmentSubtype.AlienTransplant);
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, true)).toBe(true); 
         expect(service.checkSlotEnter(drag, immuneOrgan, playerInfo, true)).toBe(true); // immune doesn't stop alien
       });

       it('should handle FailedExperiment', () => {
         const drag = createDrag(TreatmentSubtype.failedExperiment);
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, true)).toBe(false); // clean organ
         expect(service.checkSlotEnter(drag, infectedOrgan, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(drag, vaccinatedOrgan, playerInfo, true)).toBe(true);
         expect(service.checkSlotEnter(drag, immuneOrgan, playerInfo, true)).toBe(false);
       });

       it('should handle ColorThief', () => {
         const dragRed = createDrag(TreatmentSubtype.colorThiefRed);
         const dragBlue = createDrag(TreatmentSubtype.colorThiefBlue);
         const dragGreen = createDrag(TreatmentSubtype.colorThiefGreen);
         const dragYellow = createDrag(TreatmentSubtype.colorThiefYellow);
         
         // isMe -> false
         expect(service.checkSlotEnter(dragRed, createOrgan(), playerInfo, true)).toBe(false);
         expect(service.checkSlotEnter(dragRed, createOrgan(), playerInfo, false)).toBe(true);
         expect(service.checkSlotEnter(dragBlue, createOrgan(), playerInfo, false)).toBe(false); // target is red

         const blueOrgan = createOrgan({ color: CardColor.Blue });
         expect(service.checkSlotEnter(dragBlue, blueOrgan, playerInfo, false)).toBe(true);
         
         const greenOrgan = createOrgan({ color: CardColor.Green });
         expect(service.checkSlotEnter(dragGreen, greenOrgan, playerInfo, false)).toBe(true);

         const yellowOrgan = createOrgan({ color: CardColor.Yellow });
         expect(service.checkSlotEnter(dragYellow, yellowOrgan, playerInfo, false)).toBe(true);
       });

       it('should fallback to false for other treatments', () => {
         const drag = createDrag(TreatmentSubtype.Contagion);
         expect(service.checkSlotEnter(drag, createOrgan(), playerInfo, true)).toBe(false);
       });
    });

    it('should fallback to false for unknown cards', () => {
        const drag = { data: { kind: 'Unknown' as any } } as unknown as CdkDrag;
        const drop = { data: [{ color: CardColor.Red }] } as unknown as CdkDropList;
        expect(service.checkSlotEnter(drag, drop, playerInfo, true)).toBe(false);
    });
  });
});

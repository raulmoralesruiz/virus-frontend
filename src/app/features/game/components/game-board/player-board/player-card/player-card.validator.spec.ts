import { isValidDropTarget } from './player-card.validator';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { OrganOnBoard } from '@core/models/game.model';
import * as OrganUtils from '@core/utils/organ.utils';

describe('PlayerCardValidator', () => {

  const createOrgan = (opts: Partial<OrganOnBoard> = {}): OrganOnBoard => ({
    id: 'o1',
    color: CardColor.Red,
    attached: [],
    ...opts
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidDropTarget', () => {
    it('should return false if dragged is falsy', () => {
      expect(isValidDropTarget(null, createOrgan(), true)).toBe(false);
    });

    describe('cards from hand (kind property exists)', () => {
      it('should handle medicines and viruses (match color or multi)', () => {
        const medRed = { kind: CardKind.Medicine, color: CardColor.Red } as Card;
        const virBlue = { kind: CardKind.Virus, color: CardColor.Blue } as Card;
        const virMulti = { kind: CardKind.Virus, color: CardColor.Multi } as Card;

        const redOrgan = createOrgan({ color: CardColor.Red });
        const multiOrgan = createOrgan({ color: CardColor.Multi });

        expect(isValidDropTarget(medRed, redOrgan, true)).toBe(true);
        expect(isValidDropTarget(virBlue, redOrgan, false)).toBe(false);
        expect(isValidDropTarget(virMulti, redOrgan, false)).toBe(true);
        expect(isValidDropTarget(medRed, multiOrgan, true)).toBe(true);
      });

      it('should handle mutant orange organ (only on my board)', () => {
        const orangeOrg = { kind: CardKind.Organ, color: CardColor.Orange } as Card;
        expect(isValidDropTarget(orangeOrg, createOrgan(), true)).toBe(true);
        expect(isValidDropTarget(orangeOrg, createOrgan(), false)).toBe(false);
      });

      describe('Treatments', () => {
        let isImmuneSpy: jest.SpyInstance;
        let isInfectedSpy: jest.SpyInstance;
        let isVaccinatedSpy: jest.SpyInstance;

        beforeEach(() => {
          isImmuneSpy = jest.spyOn(OrganUtils, 'isImmune').mockReturnValue(false);
          isInfectedSpy = jest.spyOn(OrganUtils, 'isInfected').mockReturnValue(false);
          isVaccinatedSpy = jest.spyOn(OrganUtils, 'isVaccinated').mockReturnValue(false);
        });

        const createTreat = (subtype: TreatmentSubtype) => ({ kind: CardKind.Treatment, subtype } as Card);

        it('should handle OrganThief', () => {
           const card = createTreat(TreatmentSubtype.OrganThief);
           expect(isValidDropTarget(card, createOrgan(), false)).toBe(true); // not me
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(false); // is me
           
           isImmuneSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), false)).toBe(false); // immune
        });

        it('should handle Transplant', () => {
           const card = createTreat(TreatmentSubtype.Transplant);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(true);
           isImmuneSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(false);
        });

        it('should handle AlienTransplant', () => {
           const card = createTreat(TreatmentSubtype.AlienTransplant);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(true);
           isImmuneSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(true); // even immune
        });

        it('should handle failedExperiment', () => {
           const card = createTreat(TreatmentSubtype.failedExperiment);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(false); // not infected/vaccinated

           isInfectedSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(true);

           isVaccinatedSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(true);

           isImmuneSpy.mockReturnValue(true);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(false); // immune overrides
        });

        it('should handle ColorThief', () => {
           const cardRed = createTreat(TreatmentSubtype.colorThiefRed);
           const cardBlue = createTreat(TreatmentSubtype.colorThiefBlue);
           const cardGreen = createTreat(TreatmentSubtype.colorThiefGreen);
           const cardYellow = createTreat(TreatmentSubtype.colorThiefYellow);
           
           expect(isValidDropTarget(cardRed, createOrgan(), true)).toBe(false); // is me
           expect(isValidDropTarget(cardRed, createOrgan({ color: CardColor.Red }), false)).toBe(true);
           expect(isValidDropTarget(cardBlue, createOrgan({ color: CardColor.Blue }), false)).toBe(true);
           expect(isValidDropTarget(cardBlue, createOrgan({ color: CardColor.Red }), false)).toBe(false);
           expect(isValidDropTarget(cardGreen, createOrgan({ color: CardColor.Green }), false)).toBe(true);
           expect(isValidDropTarget(cardYellow, createOrgan({ color: CardColor.Yellow }), false)).toBe(true);
        });

        it('should return false for unmatched treatment', () => {
           const card = createTreat(TreatmentSubtype.Contagion);
           expect(isValidDropTarget(card, createOrgan(), true)).toBe(false);
        });
      });

      it('should return false for unknown kind with kind property', () => {
         const card = { kind: 'UnknownCardKind' as any } as Card;
         expect(isValidDropTarget(card, createOrgan(), true)).toBe(false);
      });
      
      it('should bypass kind=virus-token because it goes to block 2 implicitly if "virus" inside', () => {
         // If a token is dragged but doesn't have "virus" it drops down to false
         expect(isValidDropTarget({ kind: 'virus-token' }, createOrgan(), true)).toBe(false);
      });
    });

    describe('virus from another organ (contagion branch)', () => {
       it('should check if virus is multi or matches organ color', () => {
          const dragBlue = { virus: { kind: CardKind.Virus, color: CardColor.Blue } as Card };
          const dragMulti = { virus: { kind: CardKind.Virus, color: CardColor.Multi } as Card };
          const redOrgan = createOrgan({ color: CardColor.Red });
          const multiOrgan = createOrgan({ color: CardColor.Multi });

          expect(isValidDropTarget(dragBlue, redOrgan, true)).toBe(false);
          expect(isValidDropTarget(dragBlue, multiOrgan, true)).toBe(true);
          expect(isValidDropTarget(dragMulti, redOrgan, true)).toBe(true);
       });
    });
  });
});

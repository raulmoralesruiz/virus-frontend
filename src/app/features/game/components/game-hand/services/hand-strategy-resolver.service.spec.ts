import { TestBed } from '@angular/core/testing';
import { HandStrategyResolverService } from './hand-strategy-resolver.service';
import { Card, CardColor, CardKind, TreatmentSubtype } from '@core/models/card.model';
import { StandardStrategy } from '../strategies/standard.strategy';
import { TransplantStrategy } from '../strategies/transplant.strategy';
import { ThiefStrategy } from '../strategies/thief.strategy';
import { PlayerTargetStrategy } from '../strategies/player-target.strategy';
import { ContagionStrategy } from '../strategies/contagion.strategy';
import { FailedExperimentStrategy } from '../strategies/failed-experiment.strategy';
import { BodySwapStrategy } from '../strategies/body-swap.strategy';
import { SimplePlayStrategy } from '../strategies/simple-play.strategy';

describe('HandStrategyResolverService', () => {
  let service: HandStrategyResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HandStrategyResolverService]
    });
    service = TestBed.inject(HandStrategyResolverService);
  });

  describe('resolve', () => {
    it('should resolve standard strategy for Virus and Medicine', () => {
      expect(service.resolve({ kind: CardKind.Virus } as Card)).toBeInstanceOf(StandardStrategy);
      expect(service.resolve({ kind: CardKind.Medicine } as Card)).toBeInstanceOf(StandardStrategy);
    });

    it('should resolve standard strategy for Orange Organ', () => {
      expect(service.resolve({ kind: CardKind.Organ, color: CardColor.Orange } as Card)).toBeInstanceOf(StandardStrategy);
    });

    it('should resolve simple strategy for normal Organ', () => {
      expect(service.resolve({ kind: CardKind.Organ, color: CardColor.Red } as Card)).toBeInstanceOf(SimplePlayStrategy);
    });

    describe('Treatments', () => {
      const expectStrategyForSubtypes = (subtypes: TreatmentSubtype[], StrategyClass: any) => {
        subtypes.forEach(s => {
          expect(service.resolve({ kind: CardKind.Treatment, subtype: s } as Card))
            .toBeInstanceOf(StrategyClass);
        });
      };

      it('should resolve transplant strategy', () => {
        expectStrategyForSubtypes([TreatmentSubtype.Transplant, TreatmentSubtype.AlienTransplant], TransplantStrategy);
      });

      it('should resolve thief strategy', () => {
        expectStrategyForSubtypes([
          TreatmentSubtype.OrganThief,
          TreatmentSubtype.colorThiefRed,
          TreatmentSubtype.colorThiefGreen,
          TreatmentSubtype.colorThiefBlue,
          TreatmentSubtype.colorThiefYellow
        ], ThiefStrategy);
      });

      it('should resolve player target strategy', () => {
        expectStrategyForSubtypes([TreatmentSubtype.MedicalError, TreatmentSubtype.trickOrTreat], PlayerTargetStrategy);
      });

      it('should resolve contagion strategy', () => {
        expectStrategyForSubtypes([TreatmentSubtype.Contagion], ContagionStrategy);
      });

      it('should resolve failed experiment strategy', () => {
        expectStrategyForSubtypes([TreatmentSubtype.failedExperiment], FailedExperimentStrategy);
      });

      it('should resolve body swap strategy', () => {
        expectStrategyForSubtypes([TreatmentSubtype.BodySwap], BodySwapStrategy);
      });

      it('should default to simple play for unknown or unhandled treatment', () => {
        expect(service.resolve({ kind: CardKind.Treatment, subtype: TreatmentSubtype.Gloves } as Card)).toBeInstanceOf(SimplePlayStrategy);
      });
    });

    it('should default to simple play strategy for unknown card kind', () => {
       expect(service.resolve({ kind: 'Unknown' as any } as Card)).toBeInstanceOf(SimplePlayStrategy);
    });
  });
});

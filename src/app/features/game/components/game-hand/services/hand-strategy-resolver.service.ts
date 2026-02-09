import { Injectable } from '@angular/core';
import { Card, CardKind, CardColor, TreatmentSubtype } from '@core/models/card.model';
import { CardActionStrategy } from '../strategies/card-action.strategy';
import { StandardStrategy } from '../strategies/standard.strategy';
import { TransplantStrategy } from '../strategies/transplant.strategy';
import { ThiefStrategy } from '../strategies/thief.strategy';
import { PlayerTargetStrategy } from '../strategies/player-target.strategy';
import { ContagionStrategy } from '../strategies/contagion.strategy';
import { FailedExperimentStrategy } from '../strategies/failed-experiment.strategy';
import { BodySwapStrategy } from '../strategies/body-swap.strategy';
import { SimplePlayStrategy } from '../strategies/simple-play.strategy';

@Injectable()
export class HandStrategyResolverService {
  private strategies = new Map<string, CardActionStrategy>();

  constructor() {
    this.strategies.set('standard', new StandardStrategy());
    this.strategies.set('transplant', new TransplantStrategy());
    this.strategies.set('thief', new ThiefStrategy());
    this.strategies.set('player', new PlayerTargetStrategy());
    this.strategies.set('contagion', new ContagionStrategy());
    this.strategies.set('failedExperiment', new FailedExperimentStrategy());
    this.strategies.set('bodySwap', new BodySwapStrategy());
    this.strategies.set('simple', new SimplePlayStrategy());
  }

  resolve(card: Card): CardActionStrategy {
    if (card.kind === CardKind.Virus || card.kind === CardKind.Medicine) {
      return this.strategies.get('standard')!;
    }
    
    if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
        return this.strategies.get('standard')!; 
    }

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
        case TreatmentSubtype.AlienTransplant:
          return this.strategies.get('transplant')!;
        case TreatmentSubtype.OrganThief:
        case TreatmentSubtype.colorThiefRed:
        case TreatmentSubtype.colorThiefGreen:
        case TreatmentSubtype.colorThiefBlue:
        case TreatmentSubtype.colorThiefYellow:
          return this.strategies.get('thief')!;
        case TreatmentSubtype.MedicalError:
        case TreatmentSubtype.trickOrTreat:
          return this.strategies.get('player')!;
        case TreatmentSubtype.Contagion:
          return this.strategies.get('contagion')!;
        case TreatmentSubtype.failedExperiment:
          return this.strategies.get('failedExperiment')!;
        case TreatmentSubtype.BodySwap:
          return this.strategies.get('bodySwap')!;
      }
    }
    return this.strategies.get('simple')!;
  }
}

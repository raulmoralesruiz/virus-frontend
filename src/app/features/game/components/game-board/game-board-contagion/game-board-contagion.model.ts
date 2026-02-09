import { Card } from '@core/models/card.model';

export interface ContagionAssignment {
  fromOrganId: string;
  toOrganId: string;
  toPlayerId: string;
}

export interface TemporaryVirus {
  organId: string;
  playerId: string;
  virus: Card;
  isTemporary: true;
}

export interface ContagionMove {
  fromOrganId: string;
  toOrganId: string;
  toPlayerId: string;
  virus: Card;
}

export interface ContagionState {
  card: Card;
  assignments: ContagionAssignment[];
  temporaryViruses: TemporaryVirus[];
}

import { Card } from "../../../../../core/models/card.model";

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

export interface ContagionState {
  card: Card;
  assignments: ContagionAssignment[];
  temporaryViruses: TemporaryVirus[];
}

export interface VirusDropEvent {
  fromOrganId: string;
  toOrganId: string;
  toPlayerId: string;
  virus: Card;
}

export interface TransplantState {
  card: Card;
  firstOrgan: { organId: string; playerId: string } | null;
}

export interface TransplantSelectionEvent {
  card: Card;
  firstOrgan: { organId: string; playerId: string };
}

export interface FailedExperimentEvent {
  card: Card;
  target: { organId: string; playerId: string };
}

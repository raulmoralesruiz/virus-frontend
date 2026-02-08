import { Card } from './card.model';
import { PublicPlayerInfo } from './game-state.model';

export interface PlayCardTarget {
  playerId: string;
  organId: string;
}

export interface TransplantTarget {
  a: PlayCardTarget;
  b: PlayCardTarget;
}

export interface ContagionTarget {
  fromOrganId: string; // órgano infectado propio
  toPlayerId: string; // jugador destino
  toOrganId: string; // órgano destino
}

export interface MedicalErrorTarget {
  playerId: string; // solo jugador
}

export interface FailedExperimentTarget extends PlayCardTarget {
  action: 'medicine' | 'virus';
}

/** Unión de targets posibles que puede enviar el front */
export type AnyPlayTarget =
  | PlayCardTarget
  | TransplantTarget
  | MedicalErrorTarget
  | ContagionTarget[]
  | FailedExperimentTarget;

export interface BaseGamePayload {
  roomId: string;
}

export interface PlayCardPayload extends BaseGamePayload {
  playerId: string;
  cardId: string;
  target?: AnyPlayTarget;
}

export interface DiscardCardsPayload extends BaseGamePayload {
  playerId: string;
  cardIds: string[];
}

export interface GameHandPayload extends BaseGamePayload {
  playerId: string;
  hand: Card[];
}

export interface GameEndPayload extends BaseGamePayload {
  winner: PublicPlayerInfo | null;
}

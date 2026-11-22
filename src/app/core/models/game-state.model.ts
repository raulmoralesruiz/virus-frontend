import { Card, CardColor, CardKind } from './card.model';
import { Player } from './player.model';

export interface PlayerState {
  player: Player;
  hand: Card[];
}

export interface OrganOnBoard {
  id: string;
  kind: CardKind.Organ;
  color: CardColor;
  attached: Card[]; // virus o medicinas colocadas encima
}

export interface HistoryEntry {
  plainText?: string;
  player?: string;
  action?: string;
  cardName?: string;
  cardColor?: string;
  target?: string;
}

export interface PublicPlayerInfo {
  player: Player;
  board: OrganOnBoard[]; // cartas visibles en mesa
  handCount: number; // solo el número de cartas en mano, no cuáles son
  hasTrickOrTreat?: boolean;
}

export interface ApparitionDecision {
  type: 'ApparitionDecision';
  playerId: string;
  cardId: string;
}

export interface TargetSelection {
  type: 'TargetSelection';
  playerId: string;
  cardId: string;
}

export type PendingAction = ApparitionDecision | TargetSelection;

/** Reacción (emote) emitida por un jugador y enrutada por el backend a la sala. */
export interface EmoteEvent {
  id: string; // único por evento (el cliente lo genera al recibir)
  roomId: string;
  playerId: string;
  playerName: string; // resuelto en el cliente para el anuncio accesible
  emote: string;
  at: number; // timestamp (Date.now())
}

export interface PublicGameState {
  roomId: string;
  discardCount: number;
  topDiscard?: Card;
  deckCount: number;
  players: PublicPlayerInfo[];
  startedAt: string;
  turnIndex: number;
  turnDeadlineTs: number;
  turnDurationSeconds?: number; // duración total del turno; opcional: tolera backends viejos
  remainingSeconds: number;
  winner?: PublicPlayerInfo;
  history: HistoryEntry[];
  pendingAction?: PendingAction;
  timerPaused?: boolean; // true mientras hay una decisión pendiente (el timer no cuenta)
}

export interface GameState {
  roomId: string;
  deck: Card[];
  discard: Card[];
  players: PlayerState[]; // estado privado del servidor (mano real)
  public: {
    players: PublicPlayerInfo[]; // lo que ven todos
  };
  startedAt: string; // ISO string
  history: HistoryEntry[];
}

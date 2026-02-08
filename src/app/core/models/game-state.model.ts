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

export interface PublicGameState {
  roomId: string;
  discardCount: number;
  topDiscard?: Card;
  deckCount: number;
  players: PublicPlayerInfo[];
  startedAt: string;
  turnIndex: number;
  turnDeadlineTs: number;
  remainingSeconds: number;
  winner?: PublicPlayerInfo;
  history: string[];
  pendingAction?: ApparitionDecision;
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
  history: string[];
}

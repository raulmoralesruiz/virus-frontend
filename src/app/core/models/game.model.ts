import { Card } from './card.model';
import { Player } from './player.model';

export interface PlayerState {
  player: Player;
  hand: Card[];
}

export interface PublicPlayerInfo {
  player: Player;
  board: Card[]; // cartas visibles en mesa
  handCount: number; // solo el número de cartas en mano, no cuáles son
}

export interface PublicGameState {
  roomId: string;
  discardCount: number;
  deckCount: number;
  players: PublicPlayerInfo[];
  startedAt: string;
  turnIndex: number;
  turnDeadlineTs: number;
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
}

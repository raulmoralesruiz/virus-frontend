export enum CardKind {
  Organ = 'organ',
  Virus = 'virus',
  Medicine = 'medicine',
  Treatment = 'treatment',
}

export enum CardColor {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
  Yellow = 'yellow',
  Multi = 'multi',
}

export interface Card {
  id: string;
  kind: CardKind;
  color: CardColor;
}

export interface PublicPlayerInfo {
  playerId: string;
  handCount: number;
  organs?: any;
}

export interface PublicGameState {
  roomId: string;
  startedAt: string;
  discardCount: number;
  deckCount: number;
  players: PublicPlayerInfo[];
}

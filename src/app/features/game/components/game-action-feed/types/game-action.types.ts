export type GameActionType = 'play-card' | 'discard' | 'draw' | 'system';

export interface GameAction {
  id: string;
  type: GameActionType;
  message: string;
  actor?: string;
  verb?: string;
  cardLabel?: string;
  cardColor?: string;
  detail?: string;
  quantity?: number;
  timestamp: number;
}

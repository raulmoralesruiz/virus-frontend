import { Player } from './player.model';

export interface Room {
  id: string;
  name: string;
  players: Player[];
}

import { Player } from './player.model';

export interface Room {
  id: string;
  name: string;
  hostId: string; // id del jugador creador
  players: Player[];
  inProgress?: boolean;
  visibility: 'public' | 'private';
}

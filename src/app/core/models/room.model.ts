import { Player } from './player.model';

export type RoomGameMode = 'base' | 'halloween';
export type RoomTimerSeconds = 30 | 60 | 90 | 120;

export interface RoomConfig {
  mode: RoomGameMode;
  timerSeconds: RoomTimerSeconds;
}

const DEFAULT_ROOM_CONFIG: RoomConfig = {
  mode: 'halloween',
  timerSeconds: 60,
};

export const createDefaultRoomConfig = (): RoomConfig => ({ ...DEFAULT_ROOM_CONFIG });

export interface Room {
  id: string;
  name: string;
  hostId: string; // id del jugador creador
  players: Player[];
  inProgress?: boolean;
  visibility: 'public' | 'private';
  config?: RoomConfig;
}

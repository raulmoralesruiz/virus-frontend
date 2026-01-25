export const ROOM_CONSTANTS = {
  ROOM_NEW: 'room:new',
  ROOM_CREATED: 'room:created',

  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',

  ROOM_LEAVE: 'room:leave',

  ROOM_GET_ALL: 'room:getAll',
  ROOMS_LIST: 'rooms:list',
  ROOM_CONFIG_UPDATE: 'room:config:update',
} as const;

export const MAX_ROOM_PLAYERS = 6;

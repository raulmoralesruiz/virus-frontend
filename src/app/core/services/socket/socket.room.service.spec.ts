import { TestBed } from '@angular/core/testing';
import { SocketRoomService } from './socket.room.service';
import { SocketService } from './socket.service';
import { ROOM_CONSTANTS } from '../../constants/room.constants';

describe('SocketRoomService', () => {
  let service: SocketRoomService;
  
  const mockSocketService = {
      emit: jest.fn(),
      on: jest.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            SocketRoomService,
            { provide: SocketService, useValue: mockSocketService }
        ]
    });
    service = TestBed.inject(SocketRoomService);
    jest.clearAllMocks();
  });

  describe('event listeners', () => {
      it('should register onRoomsList', () => {
          const cb = jest.fn();
          service.onRoomsList(cb);
          expect(mockSocketService.on).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOMS_LIST, cb);
      });

      it('should register onRoomJoined', () => {
          const cb = jest.fn();
          service.onRoomJoined(cb);
          expect(mockSocketService.on).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_JOINED, cb);
      });

      it('should register onRoomClosed', () => {
          const cb = jest.fn();
          service.onRoomClosed(cb);
          expect(mockSocketService.on).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_CLOSED, cb);
      });

      it('should register onRoomTimer', () => {
          const cb = jest.fn();
          service.onRoomTimer(cb);
          expect(mockSocketService.on).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_TIMER, cb);
      });
  });

  describe('actions', () => {
      it('should emit createRoom', () => {
          service.createRoom({ id: 'p1' } as any, 'public');
          expect(mockSocketService.emit).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_NEW, { player: { id: 'p1' }, visibility: 'public' });
      });

      it('should emit joinRoom', () => {
          service.joinRoom('r1', { id: 'p1' } as any);
          expect(mockSocketService.emit).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_JOIN, { roomId: 'r1', player: { id: 'p1' } });
      });

      it('should emit leaveRoom', () => {
          service.leaveRoom('r1', { id: 'p1' } as any);
          expect(mockSocketService.emit).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_LEAVE, { roomId: 'r1', playerId: 'p1' });
      });

      it('should emit requestRoomsList', () => {
          service.requestRoomsList();
          expect(mockSocketService.emit).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_GET_ALL);
      });

      it('should emit updateRoomConfig', () => {
          service.updateRoomConfig('r1', { timerSeconds: 60 });
          expect(mockSocketService.emit).toHaveBeenCalledWith(ROOM_CONSTANTS.ROOM_CONFIG_UPDATE, { roomId: 'r1', config: { timerSeconds: 60 } });
      });
  });
});

import { TestBed } from '@angular/core/testing';
import { RoomStoreService } from './room-store.service';
import { ApiRoomService } from './api/api.room.service';
import { SocketRoomService } from './socket/socket.room.service';
import { Router } from '@angular/router';
import { ApiPlayerService } from './api/api.player.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('RoomStoreService', () => {
  let service: RoomStoreService;

  const mockApi = {
      roomList: signal([]),
      setCurrentRoom: jest.fn((r) => r),
      clearCurrentRoom: jest.fn(),
      getRoomList: jest.fn(),
      getRoomById: jest.fn()
  };
  const mockSocket = {
      onRoomsList: jest.fn(),
      onRoomJoined: jest.fn(),
      onRoomClosed: jest.fn(),
      onRoomTimer: jest.fn(),
      requestRoomsList: jest.fn(),
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      updateRoomConfig: jest.fn()
  };
  const mockRouter = {
      url: '/home',
      navigate: jest.fn()
  };
  const mockApiPlayer = {
      player: signal<any>(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            RoomStoreService,
            { provide: ApiRoomService, useValue: mockApi },
            { provide: SocketRoomService, useValue: mockSocket },
            { provide: Router, useValue: mockRouter },
            { provide: ApiPlayerService, useValue: mockApiPlayer }
        ]
    });
    jest.clearAllMocks();
  });

  it('should initialize and listen to socket events', () => {
      service = TestBed.inject(RoomStoreService);
      expect(mockSocket.onRoomsList).toHaveBeenCalled();
      expect(mockSocket.onRoomJoined).toHaveBeenCalled();
      expect(mockSocket.onRoomClosed).toHaveBeenCalled();
      expect(mockSocket.onRoomTimer).toHaveBeenCalled();
  });

  describe('socket callbacks', () => {
      let roomsListCb: any, roomJoinedCb: any, roomClosedCb: any, roomTimerCb: any;

      beforeEach(() => {
          service = TestBed.inject(RoomStoreService);
          roomsListCb = mockSocket.onRoomsList.mock.calls[0][0];
          roomJoinedCb = mockSocket.onRoomJoined.mock.calls[0][0];
          roomClosedCb = mockSocket.onRoomClosed.mock.calls[0][0];
          roomTimerCb = mockSocket.onRoomTimer.mock.calls[0][0];
      });

      it('should handle onRoomsList', () => {
          roomsListCb([{ id: 'r1', config: null }]);
          expect(service.rooms().length).toBe(1);
          expect(service.rooms()[0].id).toBe('r1');
          expect(service.rooms()[0].config).toBeDefined();
      });

      it('should handle onRoomJoined if player is member', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          roomJoinedCb({ id: 'r1', players: [{ id: 'p1' }], config: null });
          expect(mockApi.setCurrentRoom).toHaveBeenCalled();
          expect(service.currentRoom()?.id).toBe('r1');
      });

      it('should handle onRoomJoined if player is not member but room is current', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          service.currentRoom.set({ id: 'r1', players: [] } as any);
          roomJoinedCb({ id: 'r1', players: [{ id: 'p2' }] });
          expect(service.currentRoom()).toBeNull();
          expect(mockApi.clearCurrentRoom).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/room-list']);
      });

      it('should ignore onRoomJoined if no player id', () => {
          mockApiPlayer.player.set(null);
          roomJoinedCb({ id: 'r1', players: [] });
          expect(mockApi.setCurrentRoom).not.toHaveBeenCalled();
      });

      it('should ignore onRoomJoined if player not member and room not current', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          service.currentRoom.set({ id: 'r2', players: [] } as any);
          roomJoinedCb({ id: 'r1', players: [{ id: 'p2' }] });
          expect(service.currentRoom()?.id).toBe('r2');
          expect(mockApi.clearCurrentRoom).not.toHaveBeenCalled();
      });

      it('should handle onRoomClosed', () => {
          service.currentRoom.set({ id: 'r1'} as any);
          service.roomTimerSeconds.set(10);
          roomClosedCb();
          expect(service.currentRoom()).toBeNull();
          expect(service.roomTimerSeconds()).toBeNull();
          expect(mockApi.clearCurrentRoom).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/room-list']);
      });

      it('should handle onRoomTimer', () => {
          roomTimerCb({ remainingSeconds: 20 });
          expect(service.roomTimerSeconds()).toBe(20);
      });
  });

  describe('methods', () => {
      beforeEach(() => {
          service = TestBed.inject(RoomStoreService);
      });

      it('should getRooms', () => {
          service.getRooms();
          expect(mockApi.getRoomList).toHaveBeenCalled();
          expect(mockSocket.requestRoomsList).toHaveBeenCalled();
      });

      it('should loadRoomById and join if not member', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          mockApi.getRoomById.mockReturnValue(of({ id: 'r1', players: [] }));
          service.loadRoomById('r1');
          expect(service.currentRoom()?.id).toBe('r1');
          expect(mockSocket.joinRoom).toHaveBeenCalledWith('r1', { id: 'p1' });
      });

      it('should loadRoomById and NOT join if already member', () => {
          mockApiPlayer.player.set({ id: 'p1' });
          mockApi.getRoomById.mockReturnValue(of({ id: 'r1', players: [{ id: 'p1' }] }));
          service.loadRoomById('r1');
          expect(mockSocket.joinRoom).not.toHaveBeenCalled();
      });

      it('should loadRoomById without player safely', () => {
          mockApiPlayer.player.set(null);
          mockApi.getRoomById.mockReturnValue(of({ id: 'r1', players: [] }));
          service.loadRoomById('r1');
          expect(mockSocket.joinRoom).not.toHaveBeenCalled();
      });

      it('should createRoom defaults to public', () => {
          service.createRoom({ id: 'p1'} as any);
          expect(mockSocket.createRoom).toHaveBeenCalledWith({ id: 'p1' }, 'public');
      });

      it('should createRoom with specified visibility', () => {
          service.createRoom({ id: 'p1'} as any, 'private');
          expect(mockSocket.createRoom).toHaveBeenCalledWith({ id: 'p1' }, 'private');
      });

      it('should not join room with falsy key', () => {
          service.joinRoom(null as any, { id: 'p1' } as any);
          expect(mockSocket.joinRoom).not.toHaveBeenCalled();
      });

      it('should not join room with invalid empty string key', () => {
          service.joinRoom(' ', { id: 'p1' } as any);
          expect(mockSocket.joinRoom).not.toHaveBeenCalled();
      });

      it('should map room key from url and join', () => {
          service.joinRoom('room/abcd', { id: 'p1' } as any);
          expect(mockSocket.joinRoom).toHaveBeenCalledWith('abcd', { id: 'p1' });
      });

      it('should leaveRoom', () => {
          service.leaveRoom('r1', { id: 'p1' } as any);
          expect(mockSocket.leaveRoom).toHaveBeenCalledWith('r1', { id: 'p1' });
          expect(service.currentRoom()).toBeNull();
          expect(mockApi.clearCurrentRoom).toHaveBeenCalled();
      });

      it('should updateRoomConfig', () => {
          service.updateRoomConfig('r1', { timerSeconds: 60 });
          expect(mockSocket.updateRoomConfig).toHaveBeenCalledWith('r1', { timerSeconds: 60 });
      });

      it('should goHome', () => {
          service.goHome();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      });
  });

  describe('routing effect', () => {
      it('should do nothing if currentRoom is null', () => {
          mockRouter.url = '/home';
          service = TestBed.inject(RoomStoreService);
          service.currentRoom.set(null);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
      });

      it('should navigate to room when currentRoom is set and URL is not matching', () => {
          mockRouter.url = '/home';
          service = TestBed.inject(RoomStoreService);
          service.currentRoom.set({ id: 'r1' } as any);
          TestBed.flushEffects();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/room', 'r1']);
      });

      it('should NOT navigate if already in room', () => {
          mockRouter.url = '/room/r1';
          service = TestBed.inject(RoomStoreService);
          service.currentRoom.set({ id: 'r1' } as any);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/room', 'r1']);
      });

      it('should NOT navigate if in game for the room', () => {
          mockRouter.url = '/game/r1';
          service = TestBed.inject(RoomStoreService);
          service.currentRoom.set({ id: 'r1' } as any);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/room', 'r1']);
      });
  });
});

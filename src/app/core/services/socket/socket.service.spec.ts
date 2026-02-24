import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
import { io } from 'socket.io-client';
import { PLAYER_CONSTANTS } from '../../constants/player.constants';
import { environment } from '@env/environment';

jest.mock('socket.io-client', () => {
    const mSocket = {
        connected: false,
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
    };
    return {
        io: jest.fn(() => mSocket)
    };
});

describe('SocketService', () => {
  let service: SocketService;
  let mockSocket: any;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    mockSocket = io();
    jest.clearAllMocks();
  });

  it('should initialize and connect on construction', () => {
      service = TestBed.inject(SocketService);
      expect(io).toHaveBeenCalledWith(environment.socketUrl, { transports: ['websocket'] });
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('connect should do nothing if already connected', () => {
      service = TestBed.inject(SocketService);
      mockSocket.connected = true;
      jest.clearAllMocks();
      service.connect();
      expect(io).not.toHaveBeenCalled();
  });

  describe('connection handlers', () => {
      let Handlers: Record<string, Function> = {};
      
      beforeEach(() => {
          mockSocket.on.mockImplementation((event: string, callback: Function) => {
              Handlers[event] = callback;
          });
          service = TestBed.inject(SocketService);
      });

      it('should set connected state and not emit reconnect if player missing', () => {
          Handlers['connect']();
          expect(service.connected()).toBe(true);
          expect(mockSocket.emit).not.toHaveBeenCalled();
      });

      it('should attempt restore if player found in localstorage', () => {
          localStorage.setItem('player', JSON.stringify({ id: 'p1' }));
          Handlers['connect']();
          expect(mockSocket.emit).toHaveBeenCalledWith(PLAYER_CONSTANTS.PLAYER_RECONNECT, { playerId: 'p1' });
      });

      it('should ignore restore if localstorage parsing fails', () => {
          localStorage.setItem('player', 'invalid');
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          Handlers['connect']();
          expect(consoleSpy).toHaveBeenCalledWith('Failed to restore player session:');
          expect(mockSocket.emit).not.toHaveBeenCalled();
          consoleSpy.mockRestore();
      });

      it('should handle disconnect', () => {
          Handlers['connect']();
          expect(service.connected()).toBe(true);
          Handlers['disconnect']();
          expect(service.connected()).toBe(false);
      });
  });

  describe('socket proxies', () => {
      beforeEach(() => {
          service = TestBed.inject(SocketService);
      });

      it('should emit successfully', () => {
          service.emit('test_event', { data: 1 });
          expect(mockSocket.emit).toHaveBeenCalledWith('test_event', { data: 1 });
      });

      it('should on successfully', () => {
          const cb = jest.fn();
          service.on('test_event', cb);
          expect(mockSocket.on).toHaveBeenCalledWith('test_event', cb);
      });

      it('should off successfully', () => {
          const cb = jest.fn();
          service.off('test_event', cb);
          expect(mockSocket.off).toHaveBeenCalledWith('test_event', cb);
      });

      it('should disconnect successfully', () => {
          service.disconnect();
          expect(mockSocket.disconnect).toHaveBeenCalled();
      });
  });

  describe('unconnected edge cases', () => {
      beforeEach(() => {
        service = TestBed.inject(SocketService);
        (service as any).socket = null; // simulate no socket
      });

      it('should handle emit without socket', () => {
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          service.emit('test_event');
          expect(consoleSpy).toHaveBeenCalledWith('Socket not connected. Event "test_event" not sent.');
          consoleSpy.mockRestore();
      });

      it('should handle on without socket', () => {
          const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
          service.on('test_event', () => {});
          expect(consoleSpy).toHaveBeenCalledWith('Socket not connected. Cannot listen to "test_event".');
          consoleSpy.mockRestore();
      });

      it('should handle off without socket safely', () => {
          expect(() => service.off('test_event')).not.toThrow();
      });

      it('should handle disconnect without socket safely', () => {
          expect(() => service.disconnect()).not.toThrow();
      });
  });
});

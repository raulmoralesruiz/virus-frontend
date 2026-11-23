import { TestBed } from '@angular/core/testing';
import { SocketService, PING_INTERVAL_MS, PING_TIMEOUT_MS } from './socket.service';
import { io } from 'socket.io-client';
import { PLAYER_CONSTANTS } from '../../constants/player.constants';
import { environment } from '@env/environment';

jest.mock('socket.io-client', () => {
    const mSocket = {
        connected: false,
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        // Por defecto devolvemos algo "emit-able" para que ningún test
        // rompa si el liveness probe llega a ejecutar.
        timeout: jest.fn().mockReturnValue({ emit: jest.fn() }),
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

      // Fake timers: el handler 'connect' arranca el liveness probe; sin
      // fake timers quedaría un intervalo real vivo entre tests.
      beforeEach(() => {
          jest.useFakeTimers();
          mockSocket.on.mockImplementation((event: string, callback: Function) => {
              Handlers[event] = callback;
          });
          service = TestBed.inject(SocketService);
      });

      afterEach(() => {
          jest.useRealTimers();
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

      describe('connectionStatus', () => {
          it('should start offline before any connection', () => {
              expect(service.connectionStatus()).toBe('offline');
          });

          it('should be online after connect', () => {
              Handlers['connect']();
              expect(service.connectionStatus()).toBe('online');
          });

          it('should go offline on disconnect', () => {
              Handlers['connect']();
              Handlers['disconnect']();
              expect(service.connectionStatus()).toBe('offline');
          });

          it('should become reconnecting after a reconnect attempt (only from offline)', () => {
              Handlers['connect']();
              expect(service.connectionStatus()).toBe('online');
              Handlers['reconnect_attempt']();
              expect(service.connectionStatus()).toBe('online');

              Handlers['disconnect']();
              Handlers['reconnect_attempt']();
              expect(service.connectionStatus()).toBe('reconnecting');
          });

          it('should return to online on next connect', () => {
              Handlers['disconnect']();
              Handlers['reconnect_attempt']();
              expect(service.connectionStatus()).toBe('reconnecting');
              Handlers['connect']();
              expect(service.connectionStatus()).toBe('online');
              expect(service.connected()).toBe(true);
          });
      });
  });

  describe('liveness probe (watchdog)', () => {
      let Handlers: Record<string, Function> = {};
      let probeEmit: jest.Mock;

      beforeEach(() => {
          Handlers = {};
          probeEmit = jest.fn();
          mockSocket.timeout = jest.fn().mockReturnValue({ emit: probeEmit });
          jest.useFakeTimers();
          mockSocket.on.mockImplementation((event: string, callback: Function) => {
              Handlers[event] = callback;
          });
          service = TestBed.inject(SocketService);
      });

      afterEach(() => {
          jest.useRealTimers();
      });

      it('should schedule the probe only after connect', () => {
          expect((service as any).pingTimer).toBeNull();
          Handlers['connect']();
          expect((service as any).pingTimer).not.toBeNull();
      });

      it('should not run the probe before connecting', () => {
          jest.advanceTimersByTime(PING_INTERVAL_MS);
          expect(mockSocket.timeout).not.toHaveBeenCalled();
      });

      it('should emit client:ping with a timeout when the interval fires', () => {
          Handlers['connect']();
          jest.advanceTimersByTime(PING_INTERVAL_MS);
          expect(mockSocket.timeout).toHaveBeenCalledWith(PING_TIMEOUT_MS);
          expect(probeEmit).toHaveBeenCalledWith(PLAYER_CONSTANTS.CLIENT_PING, expect.any(Function));
      });

      it('should keep probeInFlight cleared after a successful ack', () => {
          Handlers['connect']();
          jest.advanceTimersByTime(PING_INTERVAL_MS);
          const ack = probeEmit.mock.calls[0][1];
          ack();
          expect((service as any).probeInFlight).toBe(false);
          expect(mockSocket.connect).not.toHaveBeenCalled();
      });

      it('should force a reconnect when the ack errors', () => {
          Handlers['connect']();
          jest.advanceTimersByTime(PING_INTERVAL_MS);
          const ack = probeEmit.mock.calls[0][1];
          const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
          ack(new Error('timeout'));
          expect((service as any).probeInFlight).toBe(false);
          expect(mockSocket.disconnect).toHaveBeenCalled();
          expect(mockSocket.connect).toHaveBeenCalled();
          warnSpy.mockRestore();
      });

      it('should stop the probe and not ping while offline', () => {
          Handlers['connect']();
          expect((service as any).pingTimer).not.toBeNull();
          Handlers['disconnect']();
          expect((service as any).pingTimer).toBeNull();
          jest.advanceTimersByTime(PING_INTERVAL_MS * 3);
          expect(mockSocket.timeout).not.toHaveBeenCalled();
      });
  });

  describe('browser connectivity events', () => {
      let Handlers: Record<string, Function> = {};
      let addListener: jest.SpyInstance;

      // Fake timers: el handler 'connect' arranca el liveness probe; sin
      // fake timers quedaría un intervalo real vivo entre tests.
      beforeEach(() => {
          jest.useFakeTimers();
          Handlers = {};
          mockSocket.on.mockImplementation((event: string, callback: Function) => {
              Handlers[event] = callback;
          });
          addListener = jest.spyOn(window, 'addEventListener').mockImplementation(() => {});
          service = TestBed.inject(SocketService);
      });

      afterEach(() => {
          addListener.mockRestore();
          jest.useRealTimers();
      });

      it('should register offline and online listeners on the window', () => {
          expect(addListener).toHaveBeenCalledWith('offline', expect.any(Function));
          expect(addListener).toHaveBeenCalledWith('online', expect.any(Function));
      });

      it('should go offline immediately when the window fires offline', () => {
          Handlers['connect']();
          expect(service.connectionStatus()).toBe('online');
          (service as any).offlineListener();
          expect(service.connectionStatus()).toBe('offline');
          expect(service.connected()).toBe(false);
      });

      it('should restore online + session when a zombie socket is still connected', () => {
          localStorage.setItem('player', JSON.stringify({ id: 'p1' }));
          mockSocket.connected = true;
          Handlers['disconnect']();
          expect(service.connectionStatus()).toBe('offline');
          (service as any).onlineListener();
          expect(service.connectionStatus()).toBe('online');
          expect(mockSocket.emit).toHaveBeenCalledWith(PLAYER_CONSTANTS.PLAYER_RECONNECT, { playerId: 'p1' });
      });

      it('should stay offline on online if the socket is not connected', () => {
          mockSocket.connected = false;
          Handlers['disconnect']();
          (service as any).onlineListener();
          expect(service.connectionStatus()).toBe('offline');
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

      it('should resume the existing socket on manual reconnect (no new io())', () => {
          const socketsCreated = io.mock.results.length;
          service.reconnect();
          expect(mockSocket.connect).toHaveBeenCalledTimes(1);
          expect(io.mock.results.length).toBe(socketsCreated);
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

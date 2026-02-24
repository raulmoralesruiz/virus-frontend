import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SocketGameStateService } from './socket.game.state.service';

describe('SocketGameStateService', () => {
  let service: SocketGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketGameStateService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
      expect(service.publicState()).toBeNull();
      expect(service.hand()).toEqual([]);
      expect(service.lastError()).toBeNull();
      expect(service.winner()).toBeNull();
      expect(service.activeRoomId).toBeNull();
  });

  it('setActiveRoomId should update property', () => {
      service.setActiveRoomId('r1');
      expect(service.activeRoomId).toBe('r1');
  });

  it('setPublicState should update signal', () => {
      const state = { roomId: 'r1' } as any;
      service.setPublicState(state);
      expect(service.publicState()).toBe(state);
  });

  it('setHand should update signal', () => {
      const hand = [{ id: 'c1' }] as any;
      service.setHand(hand);
      expect(service.hand()).toBe(hand);
  });

  it('setWinner should update signal', () => {
      const winner = { player: { id: 'p1'} } as any;
      service.setWinner(winner);
      expect(service.winner()).toBe(winner);
  });

  it('setLastError should update signal and clear it after timeout', () => {
      service.setLastError('error');
      expect(service.lastError()).toBe('error');
      
      jest.advanceTimersByTime(service.ERROR_TIMEOUT);
      expect(service.lastError()).toBeNull();
  });

  it('setLastError clear immediately', () => {
      service.setLastError('error');
      service.setLastError(null);
      expect(service.lastError()).toBeNull();
  });

  it('reset should clear everything', () => {
      service.setActiveRoomId('r1');
      service.setPublicState({} as any);
      service.setHand([{} as any]);
      service.setWinner({} as any);
      service.setLastError('err');

      service.reset();

      expect(service.publicState()).toBeNull();
      expect(service.hand()).toEqual([]);
      expect(service.winner()).toBeNull();
      expect(service.lastError()).toBeNull();
      expect(service.activeRoomId).toBeNull();
  });
});

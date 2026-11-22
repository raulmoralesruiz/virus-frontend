import { TestBed } from '@angular/core/testing';
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

  describe('emotes', () => {
    const ev = (emote: string) => ({
      roomId: 'r1',
      playerId: 'p1',
      playerName: 'Alice',
      emote,
      at: Date.now(),
    });

    it('addEmote should append the event with a unique id', () => {
      const a = service.addEmote(ev('👍'));
      const b = service.addEmote(ev('🔥'));

      expect(a.id).toBeTruthy();
      expect(a.id).not.toBe(b.id);
      expect(service.emotes()).toHaveLength(2);
      expect(service.emotes().map((e) => e.emote)).toEqual(['👍', '🔥']);
    });

    it('addEmote should auto-expire the emote after EMOTE_TTL_MS', () => {
      service.addEmote(ev('🍻'));
      expect(service.emotes()).toHaveLength(1);

      jest.advanceTimersByTime(service.EMOTE_TTL_MS);
      expect(service.emotes()).toHaveLength(0);
    });

    it('removeEmote should delete only the given emote', () => {
      const a = service.addEmote(ev('😱'));
      const b = service.addEmote(ev('🤣'));

      service.removeEmote(a.id);

      expect(service.emotes()).toHaveLength(1);
      expect(service.emotes()[0].id).toBe(b.id);
    });

    it('clearEmotes should remove all emotes and cancel their timers', () => {
      service.addEmote(ev('👍'));
      service.addEmote(ev('🎉'));

      service.clearEmotes();

      expect(service.emotes()).toHaveLength(0);
      // el timer cancelado no debe re-lanzar la expiración (la lista sigue vacía)
      jest.advanceTimersByTime(service.EMOTE_TTL_MS + 100);
      expect(service.emotes()).toHaveLength(0);
    });
  });

  it('reset should clear everything', () => {
      service.setActiveRoomId('r1');
      service.setPublicState({} as any);
      service.setHand([{} as any]);
      service.setWinner({} as any);
      service.setLastError('err');
      service.addEmote({ roomId: 'r1', playerId: 'p1', playerName: 'Alice', emote: '🔥', at: 0 });

      service.reset();

      expect(service.publicState()).toBeNull();
      expect(service.hand()).toEqual([]);
      expect(service.winner()).toBeNull();
      expect(service.lastError()).toBeNull();
      expect(service.emotes()).toHaveLength(0);
      expect(service.activeRoomId).toBeNull();
  });
});

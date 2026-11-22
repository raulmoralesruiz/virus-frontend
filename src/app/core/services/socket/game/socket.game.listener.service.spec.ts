import { TestBed } from '@angular/core/testing';
import { SocketGameListenerService } from './socket.game.listener.service';
import { SocketService } from '../socket.service';
import { SocketGameStateService } from './socket.game.state.service';
import { ApiPlayerService } from '../../api/api.player.service';
import { TimerSoundService } from '../../timer-sound.service';
import { GAME_CONSTANTS } from '../../../constants/game.constants';
import { signal } from '@angular/core';

describe('SocketGameListenerService', () => {
  let service: SocketGameListenerService;
  
  const mockSocketService = {
      on: jest.fn()
  };
  
  const mockState = {
      activeRoomId: null as string | null,
      publicState: signal(null),
      setActiveRoomId: jest.fn(),
      setPublicState: jest.fn(),
      setWinner: jest.fn(),
      setHand: jest.fn(),
      setLastError: jest.fn(),
      reset: jest.fn(),
      addEmote: jest.fn()
  };

  const mockApiPlayer = {
      player: signal<any>(null)
  };

  const mockSound = {
      startMusic: jest.fn(),
      stopMusic: jest.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            SocketGameListenerService,
            { provide: SocketService, useValue: mockSocketService },
            { provide: SocketGameStateService, useValue: mockState },
            { provide: ApiPlayerService, useValue: mockApiPlayer },
            { provide: TimerSoundService, useValue: mockSound }
        ]
    });
    mockState.activeRoomId = null;
    mockState.publicState.set(null);
    jest.clearAllMocks();
  });

  it('should register listeners on init', () => {
      service = TestBed.inject(SocketGameListenerService);
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_STARTED, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_HAND, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_STATE, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_ERROR, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.GAME_END, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.ROOM_RESET, expect.any(Function));
      expect(mockSocketService.on).toHaveBeenCalledWith(GAME_CONSTANTS.EMOTE, expect.any(Function));
  });

  describe('event handlers', () => {
      let Handlers: Record<string, Function> = {};

      beforeEach(() => {
          mockSocketService.on.mockImplementation((event: string, callback: Function) => {
              Handlers[event] = callback;
          });
          service = TestBed.inject(SocketGameListenerService);
      });

      describe('onGameStarted', () => {
          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.GAME_STARTED]({ roomId: 'r2' });
              expect(mockState.setActiveRoomId).not.toHaveBeenCalled();
              expect(mockSound.startMusic).not.toHaveBeenCalled();
          });

          it('should handle if room is valid (null active)', () => {
              Handlers[GAME_CONSTANTS.GAME_STARTED]({ roomId: 'r1' });
              expect(mockState.setActiveRoomId).toHaveBeenCalledWith('r1');
              expect(mockState.setPublicState).toHaveBeenCalledWith({ roomId: 'r1' });
              expect(mockState.setWinner).toHaveBeenCalledWith(null);
              expect(mockSound.startMusic).toHaveBeenCalled();
          });
      });

      describe('onGameHand', () => {
          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.GAME_HAND]({ roomId: 'r2', playerId: 'p1' });
              expect(mockState.setHand).not.toHaveBeenCalled();
          });

          it('should ignore if playerId does not match', () => {
              mockState.activeRoomId = 'r1';
              mockApiPlayer.player.set({ id: 'p2' });
              Handlers[GAME_CONSTANTS.GAME_HAND]({ roomId: 'r1', playerId: 'p1' });
              expect(mockState.setHand).not.toHaveBeenCalled();
          });

          it('should update hand if valid', () => {
              mockState.activeRoomId = 'r1';
              mockApiPlayer.player.set({ id: 'p1' });
              Handlers[GAME_CONSTANTS.GAME_HAND]({ roomId: 'r1', playerId: 'p1', hand: [{ id: 'c1' }] });
              expect(mockState.setHand).toHaveBeenCalledWith([{ id: 'c1' }]);
          });
      });

      describe('onGameState', () => {
          it('should reset if state is null', () => {
              Handlers[GAME_CONSTANTS.GAME_STATE](null);
              expect(mockState.reset).toHaveBeenCalled();
          });

          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.GAME_STATE]({ roomId: 'r2' });
              expect(mockState.setPublicState).not.toHaveBeenCalled();
          });

          it('should set state if valid', () => {
              Handlers[GAME_CONSTANTS.GAME_STATE]({ roomId: 'r1' });
              expect(mockState.setActiveRoomId).toHaveBeenCalledWith('r1');
              expect(mockState.setPublicState).toHaveBeenCalledWith({ roomId: 'r1' });
          });

          it('should ensure BGM is running for an ongoing game (no winner)', () => {
              Handlers[GAME_CONSTANTS.GAME_STATE]({ roomId: 'r1', winner: null });
              expect(mockSound.startMusic).toHaveBeenCalled();
          });

          it('should NOT start BGM if the game already has a winner', () => {
              Handlers[GAME_CONSTANTS.GAME_STATE]({ roomId: 'r1', winner: { player: { id: 'p1' } } });
              expect(mockSound.startMusic).not.toHaveBeenCalled();
          });
      });

      describe('onGameError', () => {
          it('should set error message', () => {
              Handlers[GAME_CONSTANTS.GAME_ERROR]({ message: 'err' });
              expect(mockState.setLastError).toHaveBeenCalledWith('err');
          });

          it('should set generic error if missing msg', () => {
              Handlers[GAME_CONSTANTS.GAME_ERROR]({});
              expect(mockState.setLastError).toHaveBeenCalledWith('Unknown error');
          });
      });

      describe('onGameEnd', () => {
          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.GAME_END]({ roomId: 'r2' });
              expect(mockState.setWinner).not.toHaveBeenCalled();
              expect(mockSound.stopMusic).not.toHaveBeenCalled();
          });

          it('should reset if no winner and no public state', () => {
              Handlers[GAME_CONSTANTS.GAME_END]({ roomId: 'r1', winner: null });
              expect(mockState.reset).toHaveBeenCalled();
              expect(mockSound.stopMusic).toHaveBeenCalled();
          });

          it('should set winner', () => {
              Handlers[GAME_CONSTANTS.GAME_END]({ roomId: 'r1', winner: { player: { id: 'p1' } } });
              expect(mockState.setWinner).toHaveBeenCalledWith({ player: { id: 'p1' } });
              expect(mockSound.stopMusic).toHaveBeenCalled();
          });
      });

      describe('onRoomReset', () => {
          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.ROOM_RESET]({ roomId: 'r2' });
              expect(mockState.reset).not.toHaveBeenCalled();
              expect(mockSound.stopMusic).not.toHaveBeenCalled();
          });

          it('should reset if valid', () => {
              Handlers[GAME_CONSTANTS.ROOM_RESET]({ roomId: 'r1' });
              expect(mockState.reset).toHaveBeenCalled();
              expect(mockSound.stopMusic).toHaveBeenCalled();
          });
      });

      describe('onEmote', () => {
          it('should ignore if room is not valid', () => {
              mockState.activeRoomId = 'r1';
              Handlers[GAME_CONSTANTS.EMOTE]({ roomId: 'r2', playerId: 'p1', emote: '🔥' });
              expect(mockState.addEmote).not.toHaveBeenCalled();
          });

          it('should add emote with playerName when public state has the player', () => {
              mockState.publicState.set({
                  roomId: 'r1',
                  players: [{ player: { id: 'p1', name: 'Alice' } }],
              });
              Handlers[GAME_CONSTANTS.EMOTE]({
                  roomId: 'r1',
                  playerId: 'p1',
                  emote: '🔥',
                  at: 123,
              });
              expect(mockState.addEmote).toHaveBeenCalledWith({
                  roomId: 'r1',
                  playerId: 'p1',
                  playerName: 'Alice',
                  emote: '🔥',
                  at: 123,
              });
          });

          it('should fall back to a generic playerName when player is unknown', () => {
              mockState.publicState.set({ roomId: 'r1', players: [] });
              Handlers[GAME_CONSTANTS.EMOTE]({ roomId: 'r1', playerId: 'px', emote: '🎉' });
              expect(mockState.addEmote).toHaveBeenCalledWith(
                  expect.objectContaining({ playerName: 'Jugador' })
              );
          });
      });
  });
});

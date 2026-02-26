import { TestBed } from '@angular/core/testing';
import { GameNavigationService } from './game-navigation.service';
import { Router } from '@angular/router';
import { SocketGameService } from '../../services/socket/socket.game.service';
import { ApiPlayerService } from '../api/api.player.service';
import { signal } from '@angular/core';

describe('GameNavigationService', () => {
  let service: GameNavigationService;

  const mockRouter = {
      url: '/home',
      navigate: jest.fn()
  };
  const mockSocketGame = {
      publicState: signal<any>(null)
  };
  const mockApiPlayer = {
      player: signal<any>(null)
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            GameNavigationService,
            { provide: Router, useValue: mockRouter },
            { provide: SocketGameService, useValue: mockSocketGame },
            { provide: ApiPlayerService, useValue: mockApiPlayer }
        ]
    });
    jest.clearAllMocks();
  });

  describe('routing effect', () => {
      it('should ignore if state is null', () => {
          mockSocketGame.publicState.set(null);
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
      });

      it('should ignore if player is null', () => {
          mockSocketGame.publicState.set({});
          mockApiPlayer.player.set(null);
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
      });

      it('should navigate to room-list if player is not in game and url starts with /game/', () => {
          mockRouter.url = '/game/r1';
          mockApiPlayer.player.set({ id: 'p1' });
          mockSocketGame.publicState.set({ players: [] });
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/room-list']);
      });

      it('should NOT navigate to room-list if player is not in game but url does not start with /game/', () => {
          mockRouter.url = '/home';
          mockApiPlayer.player.set({ id: 'p1' });
          mockSocketGame.publicState.set({ players: [] });
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
      });

      it('should navigate to game room if player is in game and NOT already there', () => {
          mockRouter.url = '/home';
          mockApiPlayer.player.set({ id: 'p1' });
          mockSocketGame.publicState.set({ roomId: 'r1', players: [{ player: { id: 'p1' } }] });
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/game', 'r1']);
      });

      it('should NOT navigate to game room if player is in game and ALREADY there', () => {
          mockRouter.url = '/game/r1';
          mockApiPlayer.player.set({ id: 'p1' });
          mockSocketGame.publicState.set({ roomId: 'r1', players: [{ player: { id: 'p1' } }] });
          service = TestBed.inject(GameNavigationService);
          TestBed.flushEffects();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
  });

  describe('methods', () => {
      beforeEach(() => {
          service = TestBed.inject(GameNavigationService);
      });

      it('should goHome', () => {
          service.goHome();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      });

      it('should goToRoomList', () => {
          service.goToRoomList();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/room-list']);
      });
  });
});

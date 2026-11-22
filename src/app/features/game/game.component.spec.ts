import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { GameComponent } from './game.component';
import { GameStoreService } from '@core/services/game-store.service';
import { RoomStoreService } from '@core/services/room-store.service';

describe('GameComponent', () => {
  let fixture: ComponentFixture<GameComponent>;
  let gameStoreMock: { getState: jest.Mock; stopMusic: jest.Mock };

  const mockRoute = {
    snapshot: { paramMap: { get: jest.fn().mockReturnValue('r1') } },
  };

  beforeEach(async () => {
    gameStoreMock = {
      publicState: signal(null),
      hand: signal([]),
      lastError: signal(null),
      winner: signal(null),
      emotes: signal([]),
      historyOpen: signal(false),
      leavingOpen: signal(false),
      isMyTurn: signal(false),
      remainingSeconds: signal(0),
      turnDurationSeconds: signal(0),
      history: signal([]),
      getState: jest.fn(),
      stopMusic: jest.fn(),
      closeHistoryModal: jest.fn(),
      closeLeaveModal: jest.fn(),
      leaveGame: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: GameStoreService, useValue: gameStoreMock },
        { provide: RoomStoreService, useValue: { currentRoom: signal(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
  });

  it('should request the game state on init', () => {
    expect(gameStoreMock.getState).toHaveBeenCalledWith('r1');
  });

  it('ngOnDestroy should stop the BGM (la música solo suena durante la partida)', () => {
    expect(gameStoreMock.stopMusic).not.toHaveBeenCalled();

    // Cualquier navegación que destruya la página de juego detiene la música
    // (salir, botón atrás, logout, redirección). Al reentrar, los hooks del
    // listener la reanudan — aquí solo verificamos la parada.
    fixture.destroy();

    expect(gameStoreMock.stopMusic).toHaveBeenCalled();
  });
});

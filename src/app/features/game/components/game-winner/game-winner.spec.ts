import { Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinnerComponent } from './game-winner';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { SocketService, ConnectionStatus } from '@core/services/socket/socket.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { CardColor, CardKind } from '@core/models/card.model';
import { PublicPlayerInfo, OrganOnBoard } from '@core/models/game.model';
import { Player } from '@core/models/player.model';

class TimerSoundServiceStub {
  playWinner = jest.fn();
}

const organ = (color: CardColor): OrganOnBoard => ({
  id: `organ-${color}`,
  kind: CardKind.Organ,
  color,
  attached: [],
});

const player = (id: string, name: string, board: OrganOnBoard[]): PublicPlayerInfo => ({
  player: { id, name },
  board,
  handCount: 0,
});

describe('GameWinner', () => {
  let component: GameWinnerComponent;
  let fixture: ComponentFixture<GameWinnerComponent>;
  let timerSound: TimerSoundServiceStub;
  let socketStub: { connectionStatus: Signal<ConnectionStatus>; on: jest.Mock; off: jest.Mock; emit: jest.Mock; reconnect: jest.Mock };
  let playerStub: { player: Signal<Player | null> };

  beforeEach(async () => {
    timerSound = new TimerSoundServiceStub();
    socketStub = {
      connectionStatus: signal<ConnectionStatus>('online'),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      reconnect: jest.fn(),
    };
    // Sin sesión local por defecto: la línea de consuelo no se muestra.
    playerStub = { player: signal<Player | null>(null) };

    await TestBed.configureTestingModule({
      imports: [GameWinnerComponent],
      providers: [
        { provide: TimerSoundService, useValue: timerSound },
        { provide: SocketService, useValue: socketStub },
        { provide: ApiPlayerService, useValue: playerStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameWinnerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('winner', {
      player: {
        id: 'player-1',
        name: 'Jugador 1',
      },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should play the winner sound when the winner changes', () => {
    expect(timerSound.playWinner).toHaveBeenCalled();
  });

  it('should do nothing if winner is null', () => {
    timerSound.playWinner.mockClear();
    fixture.componentRef.setInput('winner', null);
    fixture.detectChanges();
    expect(timerSound.playWinner).not.toHaveBeenCalled();
  });

  it('should emit reset', () => {
    const spy = jest.spyOn(component.reset, 'emit');
    component.onReset();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit leave', () => {
    const spy = jest.spyOn(component.leave, 'emit');
    component.onLeave();
    expect(spy).toHaveBeenCalled();
  });

  it('should close modal', () => {
    component.isVisible = true;
    component.closeModal();
    expect(component.isVisible).toBe(false);
  });

  describe('standings', () => {
    it('debe ordenar por órganos sanos y colores distintos', () => {
      fixture.componentRef.setInput('players', [
        player('p2', 'Bob', [organ(CardColor.Red), organ(CardColor.Green)]),
        player('p1', 'Alice', [
          organ(CardColor.Red),
          organ(CardColor.Green),
          organ(CardColor.Blue),
          organ(CardColor.Yellow),
        ]),
      ]);
      fixture.detectChanges();

      const standings = component.standings();
      expect(standings.map((s) => s.player.id)).toEqual(['p1', 'p2']);
      expect(standings[0].healthyOrgans).toBe(4);
      expect(standings[0].distinctColors).toBe(4);
      expect(standings[0].rank).toBe(1);
      expect(standings[1].healthyOrgans).toBe(2);
      expect(standings[1].rank).toBe(2);
    });

    it('no debe contar órganos infectados como sanos', () => {
      const infected: OrganOnBoard = {
        id: 'organ-red',
        kind: CardKind.Organ,
        color: CardColor.Red,
        attached: [{ id: 'v1', kind: CardKind.Virus, color: CardColor.Red }],
      };
      fixture.componentRef.setInput('players', [
        player('p1', 'Alice', [organ(CardColor.Red), organ(CardColor.Green)]),
        player('p2', 'Bob', [organ(CardColor.Red), organ(CardColor.Green), organ(CardColor.Blue), organ(CardColor.Yellow), infected]),
      ]);
      fixture.detectChanges();

      const standings = component.standings();
      expect(standings.map((s) => s.player.id)).toEqual(['p2', 'p1']);
      expect(standings[0].healthyOrgans).toBe(4);
    });

    it('debe renderizar la clasificación en el DOM', () => {
      fixture.componentRef.setInput('players', [
        player('p1', 'Alice', [organ(CardColor.Red)]),
      ]);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.winner-standing');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Alice');
      expect(rows[0].textContent).toContain('1 sanos');
    });
  });

  describe('duración', () => {
    it('debe calcular la duración desde startedAt', () => {
      fixture.componentRef.setInput('startedAt', new Date(Date.now() - 5 * 60000).toISOString());
      expect(component.durationLabel()).toBe('5 min');
    });

    it('debe devolver null sin startedAt', () => {
      expect(component.durationLabel()).toBeNull();
    });

    it('debe renderizar duración y acciones', () => {
      fixture.componentRef.setInput('startedAt', new Date(Date.now() - 12 * 60000).toISOString());
      fixture.componentRef.setInput('historyCount', 30);
      fixture.detectChanges();

      const meta = fixture.nativeElement.querySelector('.winner-meta');
      expect(meta.textContent).toContain('12 min');
      expect(meta.textContent).toContain('30 acciones');
    });
  });

  describe('botones', () => {
    it('deben tener texto visible con semántica', () => {
      fixture.componentRef.setInput('playerCount', 2);
      fixture.detectChanges();

      const resetText = fixture.nativeElement.querySelector('.winner-reset span');
      const leaveText = fixture.nativeElement.querySelector('.winner-leave span');
      expect(resetText.textContent).toBe('Jugar de nuevo');
      expect(leaveText.textContent).toBe('Salir');
    });

    it('no debe mostrar reset si hay menos de 2 jugadores', () => {
      fixture.componentRef.setInput('playerCount', 1);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.winner-reset')).toBeNull();
      expect(fixture.nativeElement.querySelector('.winner-leave')).toBeTruthy();
    });

    it('debe deshabilitar "Jugar de nuevo" sin conexión', () => {
      fixture.componentRef.setInput('playerCount', 2);
      socketStub.connectionStatus.set('offline');
      fixture.detectChanges();

      const resetBtn = fixture.nativeElement.querySelector('.winner-reset') as HTMLButtonElement;
      expect(resetBtn).toBeTruthy();
      expect(resetBtn.disabled).toBe(true);

      socketStub.connectionStatus.set('reconnecting');
      fixture.detectChanges();
      expect(resetBtn.disabled).toBe(true);
    });

    it('debe habilitar "Jugar de nuevo" con conexión establecida', () => {
      fixture.componentRef.setInput('playerCount', 2);
      socketStub.connectionStatus.set('online');
      fixture.detectChanges();

      const resetBtn = fixture.nativeElement.querySelector('.winner-reset') as HTMLButtonElement;
      expect(resetBtn.disabled).toBe(false);
    });
  });

  describe('reintentar conexión', () => {
    it('debe mostrar el botón cuando la conexión no está online', () => {
      fixture.componentRef.setInput('playerCount', 2);
      socketStub.connectionStatus.set('offline');
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('button.winner-reconnect') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.type).toBe('button');
      expect(btn.querySelector('.winner-reconnect__icon')).not.toBeNull();
      expect(btn.textContent).toContain('Reintentar conexión');
    });

    it('no debe mostrar el botón cuando la conexión está online', () => {
      fixture.componentRef.setInput('playerCount', 2);
      socketStub.connectionStatus.set('online');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.winner-reconnect')).toBeNull();
    });

    it('debe invocar socketService.reconnect() al pulsarse', () => {
      fixture.componentRef.setInput('playerCount', 2);
      socketStub.connectionStatus.set('reconnecting');
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.winner-reconnect') as HTMLButtonElement).click();
      expect(socketStub.reconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('línea para el perdedor', () => {
    it('debe mostrarse si el espectador no es el ganador, con su puesto', () => {
      fixture.componentRef.setInput('players', [
        player('p1', 'Alice', [organ(CardColor.Red), organ(CardColor.Green)]),
        player('p2', 'Bob', [organ(CardColor.Red)]),
      ]);
      playerStub.player.set({ id: 'p2', name: 'Bob' });
      fixture.detectChanges();

      const loser = fixture.nativeElement.querySelector('.winner-loser');
      expect(loser).toBeTruthy();
      expect(loser.textContent).toContain('2.º');
      expect(loser.textContent).toContain('buen intento');
    });
    // Nota: la rama sin puesto usa «¡Buen intento!» (mayúscula).

    it('debe mostrarse sin puesto si no aparece en la clasificación', () => {
      // Sin jugadores: standings vacío → el espectador no tiene puesto.
      playerStub.player.set({ id: 'espectador', name: 'Eva' });
      fixture.detectChanges();

      const loser = fixture.nativeElement.querySelector('.winner-loser');
      expect(loser).toBeTruthy();
      expect(loser.textContent).toContain('Buen intento');
      expect(loser.textContent).not.toContain('.º');
    });

    it('no debe mostrarse si el espectador es el ganador', () => {
      playerStub.player.set({ id: 'player-1', name: 'Jugador 1' });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.winner-loser')).toBeNull();
    });

    it('no debe mostrarse sin sesión local', () => {
      playerStub.player.set(null);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.winner-loser')).toBeNull();
    });
  });

  describe('focus trap', () => {
    it('debe cerrar al pulsar Escape dentro de la modal', () => {
      fixture.detectChanges();
      expect(component.isVisible).toBe(true);

      const modal = fixture.nativeElement.querySelector('.winner-modal');
      modal.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();

      expect(component.isVisible).toBe(false);
    });
  });
});

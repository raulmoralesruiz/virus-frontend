import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { GameStoreService } from '@core/services/game-store.service';
import { PublicPlayerInfo } from '@core/models/game.model';
import { PlayerBoardNameComponent } from './components/player-board-name/player-board-name.component';
import { PlayerBoardTrickOrTreatComponent } from './components/player-board-trick-or-treat/player-board-trick-or-treat.component';
import { PlayerBoardTurnProgressComponent } from './components/player-board-turn-progress/player-board-turn-progress.component';
import { PlayerBoardTurnTimerComponent } from './components/player-board-turn-timer/player-board-turn-timer.component';

@Component({
  selector: 'player-board-header',
  standalone: true,
  imports: [
    PlayerBoardNameComponent,
    PlayerBoardTrickOrTreatComponent,
    PlayerBoardTurnProgressComponent,
    PlayerBoardTurnTimerComponent
  ],
  templateUrl: './player-board-header.component.html',
  styleUrl: './player-board-header.component.css'
})
export class PlayerBoardHeaderComponent {
  player = input.required<PublicPlayerInfo>();
  isActive = input(false);
  isMe = input(false);
  remainingSeconds = input(0);
  timerPaused = input(false);

  private readonly timerSoundService = inject(TimerSoundService);

  turnTimerState = computed<'idle' | 'running' | 'warning' | 'critical'>(() => {
    if (!this.isActive()) return 'idle';

    const seconds = this.remainingSeconds();
    if (seconds <= 5) return 'critical';
    if (seconds <= 10) return 'warning';
    return 'running';
  });

  private readonly gameStore = inject(GameStoreService);

  /**
   * Heurística de respaldo: aprende la duración cuando el restante supera la
   * conocida (un turno nuevo). Solo se usa si el backend no envía la duración
   * real (compatibilidad con estados antiguos).
   */
  private learnedDuration = signal(0);

  /**
   * Duración total del turno: la real según el estado público de la partida.
   * Sin ella, la barra calcularía el % sobre el restante y mostraría 100%
   * tras una recarga (F5) a mitad de turno.
   */
  turnDurationSeconds = computed(() => {
    const fromStore = this.gameStore.turnDurationSeconds();
    return fromStore > 0 ? fromStore : this.learnedDuration();
  });

  isMuted = this.timerSoundService.isMuted;

  constructor() {
    effect(() => {
      const remaining = this.remainingSeconds();
      const currentDuration = this.learnedDuration();

      if (remaining > currentDuration) {
        setTimeout(() => this.learnedDuration.set(remaining));
      }
    });

    let wasActive = false;
    effect(() => {
      const isActive = this.isActive();
      const isMe = this.isMe();
      const seconds = this.remainingSeconds(); // fuerza ejecución cada segundo
      const timerState = this.turnTimerState();

      if (!isMe) {
        wasActive = false;
        return;
      }

      if (isActive && !wasActive) {
        this.timerSoundService.playTurnStart();
      }

      wasActive = isActive;

      if (!isActive) {
        return;
      }

      // ⏸️ En pausa (decisión pendiente) el tiempo no pasa: sin sonido de tic
      if (this.timerPaused()) {
        return;
      }

      this.playTickForState(timerState);
    });
  }

  private playTickForState(
    timerState: 'idle' | 'running' | 'warning' | 'critical'
  ) {
    if (this.isMuted()) {
      return; // No hacer nada si está silenciado
    }

    switch (timerState) {
      case 'warning':
        this.timerSoundService.playTick('warning');
        break;
      case 'critical':
        this.timerSoundService.playTick('critical');
        break;
      default:
        break;
    }
  }
}

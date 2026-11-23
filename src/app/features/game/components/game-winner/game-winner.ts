import { Component, computed, effect, inject, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PublicPlayerInfo, OrganOnBoard } from '@core/models/game.model';
import { CardKind } from '@core/models/card.model';
import { isInfected } from '@core/utils/organ.utils';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { SocketService } from '@core/services/socket/socket.service';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';
import { EmoteTrayComponent } from '@features/game/components/game-hand/components/emote-tray/emote-tray.component';

export interface FinalStanding {
  player: PublicPlayerInfo['player'];
  healthyOrgans: number;
  distinctColors: number;
  rank: number;
}

@Component({
  selector: 'game-winner',
  standalone: true,
  imports: [TitleCasePipe, FocusTrapDirective, EmoteTrayComponent],
  templateUrl: './game-winner.html',
  styleUrl: './game-winner.css',
})
export class GameWinnerComponent {
  private readonly timerSoundService = inject(TimerSoundService);
  private readonly socketService = inject(SocketService);
  private readonly apiPlayer = inject(ApiPlayerService);

  winner = input<{ player: PublicPlayerInfo['player'] } | null>(null);
  /** Sala actual: necesaria para que el tray de reacciones pueda enviar el emote. */
  readonly roomId = input<string | null>(null);
  readonly playerCount = input(0);
  readonly players = input<PublicPlayerInfo[]>([]);
  readonly startedAt = input<string | null>(null);
  readonly historyCount = input(0);
  reset = output<void>();
  leave = output<void>();

  isVisible = false;

  readonly medals = ['🥇', '🥈', '🥉'];

  /** true mientras la conexión no está establecida (deshabilita "Jugar de nuevo"). */
  readonly offline = computed(() => this.socketService.connectionStatus() !== 'online');

  /** id del jugador que ve la modal (null si no hay sesión local). */
  readonly myId = computed<string | null>(() => this.apiPlayer.player()?.id ?? null);

  /** true si el espectador no es el ganador: le mostramos una línea de consuelo. */
  readonly amLoser = computed(() => {
    const me = this.myId();
    const winnerId = this.winner()?.player?.id;
    return !!me && !!winnerId && me !== winnerId;
  });

  /** Puesto final del espectador en la clasificación (null si no está en ella). */
  readonly myRank = computed<number | null>(() =>
    this.standings().find((s) => s.player.id === this.myId())?.rank ?? null,
  );

  constructor() {
    effect(() => {
      const winner = this.winner();

      if (!winner) {
        return;
      }
      this.isVisible = true;
      this.timerSoundService.playWinner();
    });
  }

  /**
   * Clasificación final: órganos sanos en mesa (no infectados),
   * con desempate por colores distintos (criterio de victoria oficial).
   */
  readonly standings = computed<FinalStanding[]>(() => {
    return this.players()
      .map((p) => {
        const healthy: OrganOnBoard[] = (p.board ?? []).filter(
          (o) => o.kind === CardKind.Organ && !isInfected(o),
        );
        return {
          player: p.player,
          healthyOrgans: healthy.length,
          distinctColors: new Set(healthy.map((o) => o.color)).size,
        };
      })
      .sort(
        (a, b) =>
          b.healthyOrgans - a.healthyOrgans ||
          b.distinctColors - a.distinctColors,
      )
      .map((s, i) => ({ ...s, rank: i + 1 }));
  });

  /** Duración de la partida ("N min"), o null si no hay startedAt válido. */
  readonly durationLabel = computed<string | null>(() => {
    const raw = this.startedAt();
    if (!raw) return null;
    const start = Date.parse(raw);
    if (!Number.isFinite(start)) return null;
    const minutes = Math.max(1, Math.round((Date.now() - start) / 60000));
    return `${minutes} min`;
  });

  onReset() {
    this.reset.emit();
  }

  /** Reintento manual de la conexión desde la nota offline. */
  onReconnect() {
    this.socketService.reconnect();
  }

  onLeave() {
    this.leave.emit();
  }

  closeModal() {
    this.isVisible = false;
  }

  readonly canReset = computed(() => this.playerCount() >= 2);
}

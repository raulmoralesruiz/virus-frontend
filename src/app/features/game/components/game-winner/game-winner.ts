import { Component, computed, effect, inject, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PublicPlayerInfo, OrganOnBoard } from '@core/models/game.model';
import { CardKind } from '@core/models/card.model';
import { isInfected } from '@core/utils/organ.utils';
import { TimerSoundService } from '@core/services/timer-sound.service';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';

export interface FinalStanding {
  player: PublicPlayerInfo['player'];
  healthyOrgans: number;
  distinctColors: number;
  rank: number;
}

@Component({
  selector: 'game-winner',
  standalone: true,
  imports: [TitleCasePipe, FocusTrapDirective],
  templateUrl: './game-winner.html',
  styleUrl: './game-winner.css',
})
export class GameWinnerComponent {
  private readonly timerSoundService = inject(TimerSoundService);

  winner = input<{ player: PublicPlayerInfo['player'] } | null>(null);
  readonly playerCount = input(0);
  readonly players = input<PublicPlayerInfo[]>([]);
  readonly startedAt = input<string | null>(null);
  readonly historyCount = input(0);
  reset = output<void>();
  leave = output<void>();

  isVisible = false;

  readonly medals = ['🥇', '🥈', '🥉'];

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

  onLeave() {
    this.leave.emit();
  }

  closeModal() {
    this.isVisible = false;
  }

  readonly canReset = computed(() => this.playerCount() >= 2);
}

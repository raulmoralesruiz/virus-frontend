import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type TimerState = 'running' | 'warning' | 'critical';

const MUTED_STORAGE_KEY = 'virus-muted';
const BGM_VOLUME = 0.3; // bajo para no tapar los SFX (timer, turno, ganador)

@Injectable({ providedIn: 'root' })
export class TimerSoundService {
  private readonly document = inject(DOCUMENT);

  private readonly mutedSignal = signal<boolean>(this.readStoredMuted());
  readonly isMuted = this.mutedSignal.asReadonly();

  /** True mientras la BGM deba ser audible (partida en curso). */
  private musicActive = false;

  /**
   * Solo lectura (tests/auditoría): true mientras la BGM deba sonar.
   * Invariante: solo debe ser true durante la partida (arranca con
   * startMusic(), se anula con stopMusic() — salida de partida, fin, reset).
   */
  isMusicActive(): boolean {
    return this.musicActive;
  }

  private readonly timerSounds: Record<TimerState, HTMLAudioElement> = {
    running: this.createAudio('assets/sounds/timer/running.mp3'),
    warning: this.createAudio('assets/sounds/timer/warning.mp3'),
    critical: this.createAudio('assets/sounds/timer/critical.mp3'),
  };

  private readonly turnStartSound = this.createAudio('assets/sounds/turn.mp3');
  private readonly winnerSound = this.createAudio('assets/sounds/winner.mp3');
  private readonly bgmSound = this.createAudio('assets/sounds/music/loop.mp3');

  constructor() {
    this.bgmSound.loop = true;
    this.bgmSound.volume = BGM_VOLUME;
  }

  playTurnStart(): void {
    if (this.mutedSignal()) {
      return;
    }

    this.playAudio(this.turnStartSound);
  }

  playTick(state: TimerState): void {
    if (this.mutedSignal()) {
      return;
    }

    this.playAudio(this.timerSounds[state]);
  }

  playWinner(): void {
    if (this.mutedSignal()) {
      return;
    }

    this.playAudio(this.winnerSound);
  }

  /**
   * Inicia (o reanuda) la BGM de partida. Idempotente: las llamadas repetidas
   * no reinician el loop si ya está sonando.
   */
  startMusic(): void {
    this.musicActive = true;
    if (!this.mutedSignal() && this.bgmSound.paused) {
      this.safePlay(this.bgmSound);
    }
  }

  /** Detiene la BGM (fin de partida, reset de sala, salida). */
  stopMusic(): void {
    this.musicActive = false;
    if (!this.bgmSound.paused) {
      this.bgmSound.pause();
    }
  }

  toggleMute(): void {
    const next = !this.mutedSignal();
    this.mutedSignal.set(next);
    this.storeMuted(next);

    if (next) {
      this.bgmSound.pause();
    } else if (this.musicActive && this.bgmSound.paused) {
      // La BGM estaba activa: reanuda donde iba (loop continuo, sin reinicio).
      this.safePlay(this.bgmSound);
    }
  }

  private playAudio(audio: HTMLAudioElement): void {
    audio.currentTime = 0;
    this.safePlay(audio);
  }

  private safePlay(audio: HTMLAudioElement): void {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      // .play() puede rechazar por políticas de autoplay; no es error de app.
      playPromise.catch(() => undefined);
    }
  }

  private readStoredMuted(): boolean {
    const storage = this.getStorage();
    if (!storage) {
      return false;
    }

    try {
      return storage.getItem(MUTED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private storeMuted(muted: boolean): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(MUTED_STORAGE_KEY, String(muted));
    } catch {
      // Swallow storage exceptions (private mode, quota issues, etc.)
    }
  }

  private getStorage(): Storage | null {
    try {
      return this.document?.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.load();
    return audio;
  }
}

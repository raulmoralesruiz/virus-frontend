import { Injectable, signal } from '@angular/core';

type TimerState = 'running' | 'warning' | 'critical';

@Injectable({ providedIn: 'root' })
export class TimerSoundService {
  private readonly mutedSignal = signal(false);
  readonly isMuted = this.mutedSignal.asReadonly();

  private readonly timerSounds: Record<TimerState, HTMLAudioElement> = {
    running: this.createAudio('assets/sounds/timer/running.mp3'),
    warning: this.createAudio('assets/sounds/timer/warning.mp3'),
    critical: this.createAudio('assets/sounds/timer/critical.mp3'),
  };

  private readonly winnerSound = this.createAudio('assets/sounds/winner.mp3');

  toggleMute() {
    this.mutedSignal.update((muted) => !muted);
  }

  playTick(state: TimerState) {
    if (this.mutedSignal()) {
      return;
    }

    this.playAudio(this.timerSounds[state]);
  }

  playWinner() {
    if (this.mutedSignal()) {
      return;
    }

    this.playAudio(this.winnerSound);
  }

  private playAudio(audio: HTMLAudioElement) {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => undefined);
    }
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.load();
    return audio;
  }
}

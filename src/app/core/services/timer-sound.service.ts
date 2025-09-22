import { Injectable, signal } from '@angular/core';
import { Howl } from 'howler';

type TimerState = 'running' | 'warning' | 'critical';

@Injectable({ providedIn: 'root' })
export class TimerSoundService {
  private readonly mutedSignal = signal(false);
  readonly isMuted = this.mutedSignal.asReadonly();

  private readonly timerSounds: Record<TimerState, Howl> = {
    running: this.createHowl('assets/sounds/timer/running.mp3'),
    warning: this.createHowl('assets/sounds/timer/warning.mp3'),
    critical: this.createHowl('assets/sounds/timer/critical.mp3'),
  };

  toggleMute() {
    this.mutedSignal.update((muted) => !muted);
  }

  playTick(state: TimerState) {
    if (this.mutedSignal()) {
      return;
    }

    this.timerSounds[state].play();
  }

  private createHowl(src: string): Howl {
    return new Howl({ src: [src] });
  }
}

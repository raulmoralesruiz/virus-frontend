import { Injectable, effect, inject, signal } from '@angular/core';
import { SocketGameService } from '../../../../../core/services/socket/socket.game.service';
import { GameActionParser } from '../parsers/game-action-parser';
import { GameAction } from '../types/game-action.types';
export type { GameAction, GameActionType } from '../types/game-action.types';

@Injectable({ providedIn: 'root' })
export class GameActionFeedService {
  private socketGame = inject(SocketGameService);
  private parser = inject(GameActionParser);
  private queue = signal<GameAction[]>([]);
  private current = signal<GameAction | null>(null);
  private initialized = false;
  private historyCounts = new Map<string, number>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  currentAction = this.current.asReadonly();

  constructor() {
    effect(() => {
      const state = this.socketGame.publicState();
      if (!state) return this.reset();
      this.processHistory(state.history ?? []);
    });
  }

  dismissCurrent(): void {
    this.clearTimer();
    if (this.current()) {
      this.current.set(null);
      this.showNext();
    }
  }

  private reset() {
    this.clearTimer();
    this.queue.set([]);
    this.current.set(null);
    this.historyCounts.clear();
    this.initialized = false;
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private processHistory(history: string[]) {
    const sanitized = history.map((e) => e.trim()).filter(Boolean);
    const currentCounts = new Map<string, number>();
    const newEntries: string[] = [];
    sanitized.forEach((entry) => {
      const count = (currentCounts.get(entry) ?? 0) + 1;
      currentCounts.set(entry, count);
      if (this.initialized && count > (this.historyCounts.get(entry) ?? 0)) newEntries.push(entry);
    });
    this.historyCounts = currentCounts;
    if (!this.initialized) {
      this.initialized = true;
      return;
    }
    newEntries.reverse().forEach((entry) => {
      const action = this.parser.parse(entry);
      if (action) this.enqueue(action);
    });
  }

  private enqueue(action: GameAction) {
    this.queue.update((q) => [...q, action]);
    if (!this.current()) this.showNext();
  }

  private showNext() {
    this.clearTimer();
    const queue = this.queue();
    if (!queue.length) return this.current.set(null);
    const [next, ...rest] = queue;
    this.queue.set(rest);
    this.current.set(next);
    this.timer = setTimeout(() => {
      this.current.set(null);
      this.showNext();
    }, this.resolveDuration(next));
  }

  private resolveDuration(action: GameAction): number {
    switch (action.type) {
      case 'play-card': return action.detail?.length ? 114200 : 113600;
      case 'discard':
      case 'draw': return 113000;
      default: return 112400;
    }
  }
  // private resolveDuration(action: GameAction): number {
  //   switch (action.type) {
  //     case 'play-card': return action.detail?.length ? 4200 : 3600;
  //     case 'discard':
  //     case 'draw': return 3000;
  //     default: return 2400;
  //   }
  // }
}

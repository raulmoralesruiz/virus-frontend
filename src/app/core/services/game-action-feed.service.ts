import { Injectable, effect, inject, signal } from '@angular/core';
import { SocketGameService } from './socket/socket.game.service';

export type GameActionType = 'play-card' | 'discard' | 'draw' | 'system';

export interface GameAction {
  id: string;
  type: GameActionType;
  message: string;
  actor?: string;
  verb?: string;
  cardLabel?: string;
  detail?: string;
  quantity?: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class GameActionFeedService {
  private socketGame = inject(SocketGameService);

  private queue = signal<GameAction[]>([]);
  private current = signal<GameAction | null>(null);
  private initialized = false;
  private historyCounts = new Map<string, number>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  currentAction = this.current.asReadonly();

  constructor() {
    effect(() => {
      const state = this.socketGame.publicState();

      if (!state) {
        this.reset();
        return;
      }

      this.processHistory(state.history ?? []);
    });
  }

  dismissCurrent(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (!this.current()) {
      return;
    }

    this.current.set(null);
    this.showNext();
  }

  private reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.queue.set([]);
    this.current.set(null);
    this.historyCounts = new Map();
    this.initialized = false;
  }

  private processHistory(history: string[]) {
    const sanitized = history.map((entry) => entry.trim()).filter(Boolean);
    const currentCounts = new Map<string, number>();
    const newEntries: string[] = [];

    for (const entry of sanitized) {
      const count = (currentCounts.get(entry) ?? 0) + 1;
      currentCounts.set(entry, count);

      if (!this.initialized) {
        continue;
      }

      const previousCount = this.historyCounts.get(entry) ?? 0;
      if (count > previousCount) {
        newEntries.push(entry);
      }
    }

    this.historyCounts = currentCounts;

    if (!this.initialized) {
      this.initialized = true;
      return;
    }

    if (!newEntries.length) {
      return;
    }

    for (const entry of newEntries.reverse()) {
      const action = this.parseHistoryEntry(entry);
      if (action) {
        this.enqueue(action);
      }
    }
  }

  private enqueue(action: GameAction) {
    this.queue.update((queue) => [...queue, action]);

    if (!this.current()) {
      this.showNext();
    }
  }

  private showNext() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const queue = this.queue();
    if (!queue.length) {
      this.current.set(null);
      return;
    }

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
      case 'play-card':
        return action.detail?.length ? 4200 : 3600;
      case 'discard':
      case 'draw':
        return 3000;
      case 'system':
      default:
        return 2400;
    }
  }

  private parseHistoryEntry(entry: string): GameAction | null {
    const normalized = entry.trim();
    if (!normalized) {
      return null;
    }

    const playMatch = normalized.match(/^(?<actor>.+?) (?<verb>jugó|usó) (?<rest>.+)$/i);
    if (playMatch?.groups) {
      const actor = playMatch.groups['actor']?.trim();
      const verb = playMatch.groups['verb']?.trim();
      const rest = playMatch.groups['rest']?.trim() ?? '';
      const { cardLabel, detail } = this.extractCardAndDetail(rest);

      return {
        id: this.generateActionId(),
        type: 'play-card',
        actor,
        verb,
        cardLabel,
        detail,
        message: normalized,
        timestamp: Date.now(),
      };
    }

    const discardMatch = normalized.match(/^(?<actor>.+?) descartó (?<qty>\d+) cartas?$/i);
    if (discardMatch?.groups) {
      const actor = discardMatch.groups['actor']?.trim();
      const quantity = Number.parseInt(discardMatch.groups['qty'] ?? '0', 10) || 0;

      return {
        id: this.generateActionId(),
        type: 'discard',
        actor,
        quantity,
        message: normalized,
        timestamp: Date.now(),
      };
    }

    const drawMatch = normalized.match(/^(?<actor>.+?) robó una carta$/i);
    if (drawMatch?.groups) {
      const actor = drawMatch.groups['actor']?.trim();

      return {
        id: this.generateActionId(),
        type: 'draw',
        actor,
        message: normalized,
        timestamp: Date.now(),
      };
    }

    if (normalized.toLowerCase().startsWith('comienza la partida')) {
      return {
        id: this.generateActionId(),
        type: 'system',
        message: normalized,
        timestamp: Date.now(),
      };
    }

    if (normalized.toLowerCase().startsWith('la partida se reinició')) {
      return {
        id: this.generateActionId(),
        type: 'system',
        message: normalized,
        timestamp: Date.now(),
      };
    }

    return {
      id: this.generateActionId(),
      type: 'system',
      message: normalized,
      timestamp: Date.now(),
    };
  }

  private extractCardAndDetail(value: string): {
    cardLabel?: string;
    detail?: string;
  } {
    const separators = [' → ', ' sobre ', ' entre ', ' a '];
    for (const separator of separators) {
      const idx = value.indexOf(separator);
      if (idx >= 0) {
        const cardLabel = value.slice(0, idx).trim();
        const detail = value.slice(idx).trim();
        return { cardLabel, detail };
      }
    }

    return { cardLabel: value.trim() };
  }

  private generateActionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

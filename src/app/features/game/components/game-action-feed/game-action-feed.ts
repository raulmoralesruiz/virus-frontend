import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  GameAction,
  GameActionFeedService,
} from '../../../../core/services/game-action-feed.service';

@Component({
  selector: 'game-action-feed',
  standalone: true,
  templateUrl: './game-action-feed.html',
  styleUrl: './game-action-feed.css',
})
export class GameActionFeedComponent {
  private feed = inject(GameActionFeedService);

  private display = signal<GameAction | null>(null);
  private visible = signal(false);

  readonly action = this.display.asReadonly();
  readonly isVisible = this.visible.asReadonly();
  readonly isLeaving = computed(() => !this.visible() && !!this.display());

  icon = computed(() => this.iconFor(this.display()));
  iconClass = computed(
    () => `action-feed__icon ${this.classFor(this.display())}`
  );

  constructor() {
    effect(() => {
      const next = this.feed.currentAction();
      const current = this.display();

      if (next) {
        const nextId = next.id;
        this.display.set(next);

        const scheduleEnter = () => {
          if (this.feed.currentAction()?.id === nextId) {
            this.visible.set(true);
          }
        };

        if (typeof queueMicrotask === 'function') {
          queueMicrotask(scheduleEnter);
        } else {
          Promise.resolve().then(scheduleEnter);
        }

        return;
      }

      if (current) {
        this.visible.set(false);
      }
    });
  }

  dismiss(): void {
    if (!this.display()) {
      return;
    }

    this.feed.dismissCurrent();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.dismiss();
  }

  handleTransitionEnd(event: TransitionEvent): void {
    if (event.target !== event.currentTarget || event.propertyName !== 'opacity') {
      return;
    }

    if (!this.visible()) {
      this.display.set(null);
    }
  }

  cardsLabel(quantity?: number | null): string {
    const total = quantity ?? 0;
    if (total === 1) {
      return '1 carta';
    }
    return `${total} cartas`;
  }

  private iconFor(action: GameAction | null): string {
    if (!action) {
      return '🃏';
    }

    switch (action.type) {
      case 'play-card':
        return '🃏';
      case 'discard':
        return '🗑️';
      case 'draw':
        return '📥';
      case 'system':
      default:
        return 'ℹ️';
    }
  }

  private classFor(action: GameAction | null): string {
    if (!action) {
      return 'is-play';
    }

    switch (action.type) {
      case 'play-card':
        return 'is-play';
      case 'discard':
        return 'is-discard';
      case 'draw':
        return 'is-draw';
      case 'system':
      default:
        return 'is-system';
    }
  }
}

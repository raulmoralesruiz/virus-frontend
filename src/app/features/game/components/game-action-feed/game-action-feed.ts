import { Component, computed, effect, inject, signal } from '@angular/core';
import { GameActionFeedService } from './services/game-action-feed.service';
import { GameActionContentComponent } from './game-action-content/game-action-content';
import { GameAction } from './types/game-action.types';

@Component({
  selector: 'game-action-feed',
  standalone: true,
  imports: [GameActionContentComponent],
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

  constructor() {
    effect(() => {
      const next = this.feed.currentAction();
      const current = this.display();

      if (next) {
        const nextId = next.id;
        this.display.set(next);
        const scheduleEnter = () => {
          if (this.feed.currentAction()?.id === nextId) this.visible.set(true);
        };
        typeof queueMicrotask === 'function' ? queueMicrotask(scheduleEnter) : Promise.resolve().then(scheduleEnter);
        return;
      }

      if (current) this.visible.set(false);
    });
  }

  dismiss(): void {
    if (this.display()) this.feed.dismissCurrent();
  }

  handleKeydown(event: KeyboardEvent): void {
    if ((event.key === 'Enter' || event.key === ' ') && this.display()) {
      event.preventDefault();
      this.dismiss();
    }
  }

  handleTransitionEnd(event: TransitionEvent): void {
    if (event.target === event.currentTarget && event.propertyName === 'opacity' && !this.visible()) {
      this.display.set(null);
    }
  }
}

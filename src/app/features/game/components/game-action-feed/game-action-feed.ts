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
      console.log('effect running. next:', next);
      const current = this.display();

      if (next) {
        const nextId = next.id;
        this.display.set(next);
        const scheduleEnter = () => {
          if (this.feed.currentAction()?.id === nextId) this.visible.set(true);
        };
        setTimeout(scheduleEnter, 10);
        return;
      }

      if (current) this.visible.set(false);
    });
  }

  /**
   * Cierra el toast. Es un <button> nativo: click, Enter y Espacio
   * activan el (click) sin manejadores de teclado a mano.
   */
  dismiss(): void {
    if (this.display()) this.feed.dismissCurrent();
  }

  handleTransitionEnd(event: TransitionEvent): void {
    if (event.target === event.currentTarget && event.propertyName === 'opacity' && !this.visible()) {
      this.display.set(null);
    }
  }
}

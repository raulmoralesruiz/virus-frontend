import { Injectable, signal, computed, inject } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';

@Injectable()
export class HandDiscardService {
  private _gameStore = inject(GameStoreService);

  readonly selectedDiscardIds = signal<Set<string>>(new Set());
  readonly selectedDiscardCount = computed(() => this.selectedDiscardIds().size);

  toggleSelection(cardId: string, isMyTurn: boolean) {
    if (!isMyTurn) return;
    this.selectedDiscardIds.update((current) => {
      const next = new Set(current);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  isSelected(cardId: string): boolean {
    return this.selectedDiscardIds().has(cardId);
  }

  discard(roomId: string | null) {
     const selectedIds = Array.from(this.selectedDiscardIds());
     if (!roomId || !selectedIds.length) return;
     this._gameStore.discardCards(roomId, selectedIds);
     this.reset();
  }

  reset() {
    this.selectedDiscardIds.set(new Set());
  }
}

import { Injectable, signal, computed, inject } from '@angular/core';
import { GameStoreService } from '@core/services/game-store.service';

@Injectable()
export class HandDiscardService {
  private _gameStore = inject(GameStoreService);

  readonly selectedIndices = signal<Set<number>>(new Set());
  readonly selectedDiscardCount = computed(() => this.selectedIndices().size);

  toggleSelection(index: number, isMyTurn: boolean) {
    if (!isMyTurn) return;
    this.selectedIndices.update((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  isSelected(index: number): boolean {
    return this.selectedIndices().has(index);
  }

  discard(roomId: string | null, hand: any[]) {
     const indices = Array.from(this.selectedIndices());
     if (!roomId || !indices.length) return;
     
     const selectedIds = indices
       .map(i => hand[i]?.id)
       .filter(id => !!id);

     if (!selectedIds.length) return;

     this._gameStore.discardCards(roomId, selectedIds);
     this.reset();
  }

  reset() {
    this.selectedIndices.set(new Set());
  }
}

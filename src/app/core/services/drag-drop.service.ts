import { Injectable, signal } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Injectable({ providedIn: 'root' })
export class DragDropService {
  private handLists = signal<Record<string, string>>({});
  private boardLists = signal<Record<string, string>>({});

  setHandListId(playerId: string, id: string) {
    this.handLists.update((map) => ({ ...map, [playerId]: id }));
  }

  setBoardListId(playerId: string, id: string) {
    this.boardLists.update((map) => ({ ...map, [playerId]: id }));
  }

  handListId(playerId: string): string | null {
    return this.handLists()[playerId] ?? null;
  }

  boardListId(playerId: string): string | null {
    return this.boardLists()[playerId] ?? null;
  }

  draggedItem = signal<any | null>(null);
}

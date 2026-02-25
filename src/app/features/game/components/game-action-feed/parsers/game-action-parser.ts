import { Injectable } from '@angular/core';
import { GameAction } from '../types/game-action.types';
import { HistoryEntry } from '@core/models/game.model';

@Injectable({ providedIn: 'root' })
export class GameActionParser {
  parse(entry: HistoryEntry): GameAction | null {
    if (!entry) return null;

    if (entry.player && entry.action) {
      if (entry.action === 'robó') {
        return {
          id: this.generateId(),
          type: 'draw',
          actor: entry.player,
          message: entry.plainText || `${entry.player} robó ${entry.target}`,
          timestamp: Date.now(),
        };
      }

      if (entry.action === 'descartó') {
        const qtyMatch = entry.target?.match(/\d+/);
        return {
          id: this.generateId(),
          type: 'discard',
          actor: entry.player,
          quantity: qtyMatch ? parseInt(qtyMatch[0], 10) : 0,
          message: entry.plainText || `${entry.player} descartó ${entry.target}`,
          timestamp: Date.now(),
        };
      }

      if (entry.action === 'jugó' || entry.action === 'usó') {
        return {
          id: this.generateId(),
          type: 'play-card',
          actor: entry.player,
          verb: entry.action,
          cardLabel: entry.cardName,
          cardColor: entry.cardColor,
          detail: entry.target,
          message: entry.plainText || `${entry.player} ${entry.action} ${entry.cardName}${entry.target || ''}`,
          timestamp: Date.now(),
        };
      }
    }

    if (entry.plainText) {
      return {
        id: this.generateId(),
        type: 'system',
        message: entry.plainText,
        timestamp: Date.now(),
      };
    }

    return null;
  }


  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

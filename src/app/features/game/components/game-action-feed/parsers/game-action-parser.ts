import { Injectable } from '@angular/core';
import { GameAction } from '../types/game-action.types';

@Injectable({ providedIn: 'root' })
export class GameActionParser {
  parse(entry: string): GameAction | null {
    const normalized = entry.trim();
    if (!normalized) return null;

    const playMatch = normalized.match(/^(?<actor>.+?) (?<verb>jugó|usó) (?<rest>.+)$/i);
    if (playMatch?.groups) {
      const { actor, verb, rest } = playMatch.groups;
      const { cardLabel, detail } = this.extractCardAndDetail(rest.trim());
      return {
        id: this.generateId(),
        type: 'play-card',
        actor: actor.trim(),
        verb: verb.trim(),
        cardLabel,
        detail,
        message: normalized,
        timestamp: Date.now(),
      };
    }

    const discardMatch = normalized.match(/^(?<actor>.+?) descartó (?<qty>\d+) cartas?$/i);
    if (discardMatch?.groups) {
      return {
        id: this.generateId(),
        type: 'discard',
        actor: discardMatch.groups['actor'].trim(),
        quantity: parseInt(discardMatch.groups['qty'], 10) || 0,
        message: normalized,
        timestamp: Date.now(),
      };
    }

    const drawMatch = normalized.match(/^(?<actor>.+?) robó una carta$/i);
    if (drawMatch?.groups) {
      return {
        id: this.generateId(),
        type: 'draw',
        actor: drawMatch.groups['actor'].trim(),
        message: normalized,
        timestamp: Date.now(),
      };
    }

    const isSystem =
      normalized.toLowerCase().startsWith('comienza la partida') ||
      normalized.toLowerCase().startsWith('la partida se reinició');

    return {
      id: this.generateId(),
      type: 'system',
      message: normalized,
      timestamp: Date.now(),
    };
  }

  private extractCardAndDetail(value: string): { cardLabel?: string; detail?: string } {
    const separators = [' → ', ' sobre ', ' entre ', ' a '];
    for (const separator of separators) {
      const idx = value.indexOf(separator);
      if (idx >= 0) {
        return {
          cardLabel: value.slice(0, idx).trim(),
          detail: value.slice(idx).trim(),
        };
      }
    }
    return { cardLabel: value.trim() };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

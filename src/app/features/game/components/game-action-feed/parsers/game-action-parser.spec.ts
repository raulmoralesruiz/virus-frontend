import { TestBed } from '@angular/core/testing';
import { GameActionParser } from './game-action-parser';

describe('GameActionParser', () => {
  let parser: GameActionParser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    parser = TestBed.inject(GameActionParser);
  });

  describe('parse', () => {
    it('should return null for empty string', () => {
      expect(parser.parse('   ')).toBeNull();
    });

    it('should parse play card action', () => {
      const result = parser.parse('Player1 jugó Órgano Corazón');
      expect(result).toMatchObject({
        type: 'play-card',
        actor: 'Player1',
        verb: 'jugó',
        cardLabel: 'Órgano Corazón',
        detail: undefined,
        message: 'Player1 jugó Órgano Corazón'
      });
    });

    it('should parse play card action with details', () => {
      const result = parser.parse('P2 usó Ladrón de Órganos → sobre P1');
      expect(result).toMatchObject({
        type: 'play-card',
        actor: 'P2',
        verb: 'usó',
        cardLabel: 'Ladrón de Órganos',
        detail: '→ sobre P1'
      });
    });
    
    it('should extract card details picking the first separator', () => {
        const result = parser.parse('P1 usó Medicina a P2');
        expect(result?.cardLabel).toBe('Medicina');
        expect(result?.detail).toBe('a P2');
    });

    it('should parse discard action - single card', () => {
      const result = parser.parse('Player3 descartó 1 carta');
      expect(result).toMatchObject({
        type: 'discard',
        actor: 'Player3',
        quantity: 1,
        message: 'Player3 descartó 1 carta'
      });
    });

    it('should parse discard action - multiple cards', () => {
      const result = parser.parse('P4 descartó 3 cartas');
      expect(result).toMatchObject({
        type: 'discard',
        actor: 'P4',
        quantity: 3
      });
    });

    it('should handle zero gracefully in discard', () => {
        const result = parser.parse('P4 descartó 0 cartas');
        expect(result?.type).toBe('discard');
        expect((result as any).quantity).toBe(0);
    });

    it('should parse draw action', () => {
      const result = parser.parse('Player5 robó una carta');
      expect(result).toMatchObject({
        type: 'draw',
        actor: 'Player5',
        message: 'Player5 robó una carta'
      });
    });

    it('should parse system actions', () => {
      let result = parser.parse('Comienza la partida!');
      expect(result).toMatchObject({ type: 'system' });

      result = parser.parse('La partida se reinició.');
      expect(result).toMatchObject({ type: 'system' });
    });

    it('should parse unrecognized as system action', () => {
      const result = parser.parse('Algo pasó');
      expect(result).toMatchObject({ type: 'system', message: 'Algo pasó' });
    });
  });
});

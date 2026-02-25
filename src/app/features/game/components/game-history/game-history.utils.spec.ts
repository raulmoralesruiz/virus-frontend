import { parseGameHistoryTarget } from './game-history.utils';

describe('GameHistoryUtils', () => {
  describe('parseGameHistoryTarget', () => {
    it('should return empty array for undefined target', () => {
      expect(parseGameHistoryTarget(undefined)).toEqual([]);
    });

    it('should return a single segment if no organs are found', () => {
      const result = parseGameHistoryTarget('sobre jugador1');
      expect(result).toEqual([{ text: 'sobre jugador1', isOrgan: false }]);
    });

    it('should extract a single organ and its color class', () => {
      const result = parseGameHistoryTarget('sobre Órgano Estómago de jugador1');
      expect(result).toEqual([
        { text: 'sobre ', isOrgan: false },
        { text: 'Órgano Estómago', isOrgan: true, colorClass: 'history-target--green' },
        { text: ' de jugador1', isOrgan: false }
      ]);
    });

    it('should handle extracting two organs separated by text', () => {
      const result = parseGameHistoryTarget('entre jugador1 (Órgano Mutante) y jugador2 (Órgano Multicolor)');
      expect(result).toEqual([
        { text: 'entre jugador1 (', isOrgan: false },
        { text: 'Órgano Mutante', isOrgan: true, colorClass: 'history-target--orange' },
        { text: ') y jugador2 (', isOrgan: false },
        { text: 'Órgano Multicolor', isOrgan: true, colorClass: 'history-target--multi' },
        { text: ')', isOrgan: false }
      ]);
    });

    it('should identify all primary organ colors', () => {
      const testCases = [
        { text: 'Órgano Corazón', expectedClass: 'history-target--red' },
        { text: 'Órgano Cerebro', expectedClass: 'history-target--blue' },
        { text: 'Órgano Hueso', expectedClass: 'history-target--yellow' },
      ];

      testCases.forEach(tc => {
        const result = parseGameHistoryTarget(`test ${tc.text} test`);
        expect(result).toContainEqual({
          text: tc.text,
          isOrgan: true,
          colorClass: tc.expectedClass
        });
      });
    });
  });
});

import { StandardStrategy } from './standard.strategy';
import { CardKind, CardColor } from '@core/models/card.model';

describe('StandardStrategy', () => {
  let strategy: StandardStrategy;

  beforeEach(() => {
    strategy = new StandardStrategy();
  });

  describe('getTargets', () => {
    it('should return targets for self if orange organ', () => {
      const gameState: any = {
        players: [
          { player: { id: 'p1', name: 'Player 1' }, board: [{ id: 'o1', color: CardColor.Red }] },
          { player: { id: 'p2', name: 'Player 2' }, board: [] }
        ]
      };
      const card: any = { kind: CardKind.Organ, color: CardColor.Orange };
      
      const targets = strategy.getTargets(gameState, card, 'p1');
      expect(targets).toEqual([
        { playerName: 'Player 1', playerId: 'p1', organId: 'o1', organColor: CardColor.Red }
      ]);
    });

    it('should return empty targets if self not found for orange organ', () => {
      const gameState: any = {
        players: []
      };
      const card: any = { kind: CardKind.Organ, color: CardColor.Orange };
      
      const targets = strategy.getTargets(gameState, card, 'p1');
      expect(targets).toEqual([]);
    });

    it('should return targets for all players if not orange organ', () => {
      const gameState: any = {
        players: [
          { player: { id: 'p1', name: 'Player 1' }, board: [{ id: 'o1', color: CardColor.Red }] },
          { player: { id: 'p2', name: 'Player 2' }, board: [{ id: 'o2', color: CardColor.Blue }] }
        ]
      };
      const card: any = { kind: CardKind.Organ, color: CardColor.Red };
      
      const targets = strategy.getTargets(gameState, card, 'p1');
      expect(targets).toEqual([
        { playerName: 'Player 1', playerId: 'p1', organId: 'o1', organColor: CardColor.Red },
        { playerName: 'Player 2', playerId: 'p2', organId: 'o2', organColor: CardColor.Blue }
      ]);
    });
  });

  it('canPlay should be true if target selected', () => {
    expect(strategy.canPlay({ selectedTarget: {} as any })).toBe(true);
    expect(strategy.canPlay({ selectedTarget: null })).toBe(false);
  });

  it('getPlayPayload should return selectedTarget', () => {
    const target = { playerId: 'p2' } as any;
    expect(strategy.getPlayPayload({ selectedTarget: target })).toBe(target);
  });
});

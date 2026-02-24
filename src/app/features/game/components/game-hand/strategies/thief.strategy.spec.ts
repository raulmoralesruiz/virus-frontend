import { ThiefStrategy } from './thief.strategy';

describe('ThiefStrategy', () => {
  let strategy: ThiefStrategy;

  beforeEach(() => {
    strategy = new ThiefStrategy();
  });

  it('should return all organs from all players', () => {
    const gameState: any = {
      players: [
        { player: { id: 'p1', name: 'Player 1' }, board: [{ id: 'o1', color: 'red' }] },
        { player: { id: 'p2', name: 'Player 2' }, board: [{ id: 'o2', color: 'blue' }] }
      ]
    };
    
    const targets = strategy.getTargets(gameState, {} as any);
    expect(targets).toEqual([
      { playerName: 'Player 1', playerId: 'p1', organId: 'o1', organColor: 'red' },
      { playerName: 'Player 2', playerId: 'p2', organId: 'o2', organColor: 'blue' }
    ]);
  });

  it('canPlay should return true if target selected', () => {
    expect(strategy.canPlay({ selectedTarget: {} as any })).toBe(true);
    expect(strategy.canPlay({ selectedTarget: null })).toBe(false);
  });

  it('getPlayPayload should return target', () => {
    const target: any = { playerId: 'p1' };
    expect(strategy.getPlayPayload({ selectedTarget: target })).toEqual(target);
  });
});

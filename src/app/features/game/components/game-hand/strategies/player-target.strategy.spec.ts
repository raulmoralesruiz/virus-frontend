import { PlayerTargetStrategy } from './player-target.strategy';

describe('PlayerTargetStrategy', () => {
  let strategy: PlayerTargetStrategy;

  beforeEach(() => {
    strategy = new PlayerTargetStrategy();
  });

  it('should return targets for other players', () => {
    const gameState: any = {
      players: [
         { player: { id: 'p1', name: 'Player 1' } },
         { player: { id: 'p2', name: 'Player 2' } }
      ]
    };
    
    const targets = strategy.getTargets(gameState, {} as any, 'p1');
    expect(targets).toEqual([{
        playerName: 'Player 2',
        playerId: 'p2',
        organId: ''
    }]);
  });

  it('canPlay should return true if target is selected', () => {
    expect(strategy.canPlay({ selectedTarget: { playerId: 'p2' } as any })).toBe(true);
    expect(strategy.canPlay({ selectedTarget: null })).toBe(false);
  });

  it('getPlayPayload should return playerId', () => {
    expect(strategy.getPlayPayload({ selectedTarget: { playerId: 'p2' } as any })).toEqual({ playerId: 'p2' });
  });
});

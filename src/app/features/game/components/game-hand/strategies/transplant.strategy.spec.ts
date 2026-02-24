import { TransplantStrategy } from './transplant.strategy';

describe('TransplantStrategy', () => {
  let strategy: TransplantStrategy;

  beforeEach(() => {
    strategy = new TransplantStrategy();
  });

  it('should return all organs from all players', () => {
    const gameState: any = {
      players: [
        { player: { id: 'p1', name: 'Player 1' }, board: [{ id: 'o1', color: 'red' }] }
      ]
    };
    
    const targets = strategy.getTargets(gameState, {} as any);
    expect(targets).toEqual([
      { playerName: 'Player 1', playerId: 'p1', organId: 'o1', organColor: 'red' }
    ]);
  });

  it('canPlay should return true if both targets selected and different', () => {
    expect(strategy.canPlay({
        selectedTargetA: { organId: 'o1' } as any,
        selectedTargetB: { organId: 'o2' } as any
    })).toBe(true);

    expect(strategy.canPlay({
        selectedTargetA: { organId: 'o1' } as any,
        selectedTargetB: { organId: 'o1' } as any
    })).toBe(false);

    expect(strategy.canPlay({
        selectedTargetA: null,
        selectedTargetB: { organId: 'o2' } as any
    })).toBe(false);
  });

  it('getPlayPayload should return both targets', () => {
    const a: any = { organId: 'o1' };
    const b: any = { organId: 'o2' };
    expect(strategy.getPlayPayload({ selectedTargetA: a, selectedTargetB: b })).toEqual({ a, b });
  });
});

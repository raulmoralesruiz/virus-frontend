import { BodySwapStrategy } from './body-swap.strategy';

describe('BodySwapStrategy', () => {
  let strategy: BodySwapStrategy;

  beforeEach(() => {
    strategy = new BodySwapStrategy();
  });

  it('should return empty targets', () => {
    expect(strategy.getTargets({} as any, {} as any)).toEqual([]);
  });

  it('should be able to play if direction selected', () => {
    expect(strategy.canPlay({ selectedDirection: 'clockwise' })).toBe(true);
    expect(strategy.canPlay({ selectedDirection: null } as any)).toBe(false);
  });

  it('should return direction payload', () => {
    expect(strategy.getPlayPayload({ selectedDirection: 'clockwise' })).toEqual({ direction: 'clockwise' });
  });
});

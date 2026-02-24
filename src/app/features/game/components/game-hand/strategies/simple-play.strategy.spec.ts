import { SimplePlayStrategy } from './simple-play.strategy';

describe('SimplePlayStrategy', () => {
  let strategy: SimplePlayStrategy;

  beforeEach(() => {
    strategy = new SimplePlayStrategy();
  });

  it('should return empty targets', () => {
    expect(strategy.getTargets({} as any, {} as any)).toEqual([]);
  });

  it('should always be able to play', () => {
    expect(strategy.canPlay(null)).toBe(true);
  });

  it('should return undefined payload', () => {
    expect(strategy.getPlayPayload(null)).toBeUndefined();
  });
});

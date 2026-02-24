import { ContagionStrategy } from './contagion.strategy';

describe('ContagionStrategy', () => {
  let strategy: ContagionStrategy;

  beforeEach(() => {
    strategy = new ContagionStrategy();
  });

  it('should return empty targets', () => {
    expect(strategy.getTargets({} as any, {} as any)).toEqual([]);
  });

  it('should be able to play if has valid assignments', () => {
    expect(strategy.canPlay({ contagionAssignments: null } as any)).toBeFalsy();
    expect(strategy.canPlay({ contagionAssignments: [] })).toBeFalsy();
    expect(strategy.canPlay({ contagionAssignments: [{ toOrganId: null }] })).toBeFalsy();
    expect(strategy.canPlay({ contagionAssignments: [{ toOrganId: '1', toPlayerId: 'p1' }] })).toBe(true);
  });

  it('should return filtered valid assignments for payload', () => {
    const payload = strategy.getPlayPayload({
        contagionAssignments: [
            { toOrganId: '1', toPlayerId: 'p1' },
            { toOrganId: null }
        ]
    });
    expect(payload).toEqual([{ toOrganId: '1', toPlayerId: 'p1' }]);
  });
});

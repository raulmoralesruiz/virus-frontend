import { FailedExperimentStrategy } from './failed-experiment.strategy';
import { CardColor, CardKind } from '@core/models/card.model';

describe('FailedExperimentStrategy', () => {
  let strategy: FailedExperimentStrategy;

  beforeEach(() => {
    strategy = new FailedExperimentStrategy();
  });

  describe('getTargets', () => {
    it('should return infected or vaccinated non-immune organs', () => {
      const gameState: any = {
        players: [
          {
            player: { id: 'p1', name: 'Player 1' },
            board: [
              // Infected (not immune)
              { id: 'o1', color: CardColor.Red, attached: [{ kind: CardKind.Virus }] },
              // Vaccinated (not immune)
              { id: 'o2', color: CardColor.Blue, attached: [{ kind: CardKind.Medicine }] },
              // Immune (vaccinated x2)
              { id: 'o3', color: CardColor.Green, attached: [{ kind: CardKind.Medicine }, { kind: CardKind.Medicine }] },
              // Clean
              { id: 'o4', color: CardColor.Yellow, attached: [] }
            ]
          }
        ]
      };
      
      const targets = strategy.getTargets(gameState, {} as any);
      expect(targets).toEqual([
        { playerName: 'Player 1', playerId: 'p1', organId: 'o1', organColor: CardColor.Red },
        { playerName: 'Player 1', playerId: 'p1', organId: 'o2', organColor: CardColor.Blue }
      ]);
    });
  });

  it('canPlay should return true if target and action selected', () => {
    expect(strategy.canPlay({ selectedTarget: {} as any, selectedActionForFailedExperiment: 'virus' })).toBe(true);
    expect(strategy.canPlay({ selectedTarget: null, selectedActionForFailedExperiment: 'virus' })).toBe(false);
    expect(strategy.canPlay({ selectedTarget: {} as any, selectedActionForFailedExperiment: null })).toBe(false);
  });

  it('getPlayPayload should return merged target and action', () => {
    const payload = strategy.getPlayPayload({
        selectedTarget: { playerId: 'p1', organId: 'o1' } as any,
        selectedActionForFailedExperiment: 'medicine'
    });
    expect(payload).toEqual({ playerId: 'p1', organId: 'o1', action: 'medicine' });
  });
});

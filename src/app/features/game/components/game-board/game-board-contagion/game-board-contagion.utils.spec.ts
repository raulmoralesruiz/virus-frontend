import { restoreOriginalVirusPositions, getTemporaryViruses, hasTemporaryVirus } from './game-board-contagion.utils';
import { ContagionState } from './game-board-contagion.model';
import { PublicGameState } from '@core/models/game.model';
import { Card } from '@core/models/card.model';

describe('GameBoardContagionUtils', () => {
  describe('restoreOriginalVirusPositions', () => {
    it('should correctly restore viruses back to source organs', () => {
      const state: ContagionState = {
        card: { id: 'c1' } as any,
        assignments: [
          { fromOrganId: 'org1', toOrganId: 'org2', toPlayerId: 'p2' }
        ],
        temporaryViruses: [
          { organId: 'org2', playerId: 'p2', virus: { id: 'v1' } as any, isTemporary: true }
        ]
      };

      const gameState: PublicGameState = {
        roomId: 'r1',
        history: [],
        turnIndex: 0,
        players: [
          {
            player: { id: 'p1' } as any,
            board: [
              { id: 'org1', attached: [] } as any
            ]
          },
          {
            player: { id: 'p2' } as any,
            board: [
              { id: 'org2', attached: [{ id: 'v1' }, { id: 'v2' }] } as any
            ]
          }
        ]
      };

      restoreOriginalVirusPositions(state, gameState);

      // Verify source organ got it back
      expect(gameState.players[0].board[0].attached).toEqual([{ id: 'v1' }]);
      
      // Verify target organ lost it
      expect(gameState.players[1].board[0].attached).toEqual([{ id: 'v2' }]);
    });

    it('should fail gracefully if source player not found', () => {
      const state = { assignments: [{ fromOrganId: 'fake', toPlayerId: 'p2' }] } as any;
      const gameState = { players: [{ board: [], player: { id: 'p2'} }] } as any;
      expect(() => restoreOriginalVirusPositions(state, gameState)).not.toThrow();
    });

    it('should fail gracefully if virus not found in target organ', () => {
      const state: ContagionState = {
        card: { id: 'c1' } as any,
        assignments: [
          { fromOrganId: 'org1', toOrganId: 'org2', toPlayerId: 'p2' }
        ],
        temporaryViruses: [
          { organId: 'org2', playerId: 'p2', virus: { id: 'v1' } as any, isTemporary: true }
        ]
      };

      const gameState: PublicGameState = {
        roomId: 'r1',
        history: [],
        turnIndex: 0,
        players: [
          {
            player: { id: 'p1' } as any,
            board: [
              { id: 'org1', attached: [] } as any
            ]
          },
          {
            player: { id: 'p2' } as any,
            board: [
              { id: 'org2', attached: [{ id: 'v2' }] } as any // v1 missing
            ]
          }
        ]
      };

      restoreOriginalVirusPositions(state, gameState);
      expect(gameState.players[0].board[0].attached).toEqual([]);
      expect(gameState.players[1].board[0].attached).toEqual([{ id: 'v2' }]);
    });
  });

  describe('getTemporaryViruses', () => {
    it('should filter temporary viruses by organ and player and add isTemporary flag', () => {
      const state = {
        temporaryViruses: [
          { organId: 'o1', playerId: 'p1', virus: { id: 'v1' } },
          { organId: 'o2', playerId: 'p1', virus: { id: 'v2' } },
          { organId: 'o1', playerId: 'p2', virus: { id: 'v3' } }
        ]
      } as any;

      const result = getTemporaryViruses(state, 'o1', 'p1');
      expect(result).toEqual([{ id: 'v1', isTemporary: true }]);
    });
  });

  describe('hasTemporaryVirus', () => {
    it('should return true if match exists', () => {
      const state = {
        temporaryViruses: [
          { organId: 'o1', playerId: 'p1' }
        ]
      } as any;
      expect(hasTemporaryVirus(state, 'o1', 'p1')).toBe(true);
      expect(hasTemporaryVirus(state, 'o2', 'p1')).toBe(false);
    });
  });
});

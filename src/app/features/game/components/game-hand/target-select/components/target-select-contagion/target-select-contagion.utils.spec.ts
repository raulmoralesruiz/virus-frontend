import { getContagionPlayerOptions, getContagionOrgansForPlayer, findOrganById, getContagionSourceLabel, getContagionVirusLabel } from './target-select-contagion.utils';
import { CardColor } from '@core/models/card.model';

describe('TargetSelectContagionUtils', () => {
  const mockState: any = {
    players: [
      { player: { id: 'p1', name: 'Player 1' }, board: [{ id: 'o1', attached: [], color: 'red' }] },
      { player: { id: 'p2', name: 'Player 2' }, board: [{ id: 'o2', attached: [{}], color: CardColor.Orange }, { id: 'o4', attached: [{}], color: '' }, { id: 'o5', attached: [{}], color: 'purple' }] }
    ]
  };

  describe('getContagionPlayerOptions', () => {
    it('should return players with free organs or existing assignments', () => {
      expect(getContagionPlayerOptions(null, [])).toEqual([]);
      
      const options = getContagionPlayerOptions(mockState, []);
      expect(options).toEqual([{ id: 'p1', name: 'Player 1' }]); // p2 has no free organ
      
      const optionsWithAssignment = getContagionPlayerOptions(mockState, [{ fromOrganId: 'x', toOrganId: 'y', toPlayerId: 'p2' }, { fromOrganId: 'z', toOrganId: 'w', toPlayerId: '' }]);
      expect(optionsWithAssignment).toEqual([
          { id: 'p1', name: 'Player 1' },
          { id: 'p2', name: 'Player 2' } // included because of assignment
      ]);
    });
  });

  describe('getContagionOrgansForPlayer', () => {
    it('should return free organs for player', () => {
       expect(getContagionOrgansForPlayer(null, 'p1')).toEqual([]);
       expect(getContagionOrgansForPlayer(mockState, '')).toEqual([]);
       
       expect(getContagionOrgansForPlayer(mockState, 'p1')).toEqual([{
           playerId: 'p1',
           playerName: 'Player 1',
           organId: 'o1',
           organColor: 'red'
       }]);

       expect(getContagionOrgansForPlayer(mockState, 'p2')).toEqual([]);
       expect(getContagionOrgansForPlayer(mockState, 'p3')).toEqual([]); // not found
    });
  });

  describe('findOrganById', () => {
      it('should find organ and player name', () => {
          expect(findOrganById(null, 'o1')).toBeNull();
          expect(findOrganById(mockState, 'o3')).toBeNull();
          
          expect(findOrganById(mockState, 'o1')).toEqual({
              organ: { id: 'o1', attached: [], color: 'red' },
              playerName: 'Player 1'
          });
      });
  });

  describe('getContagionSourceLabel', () => {
      it('should return label with color or id', () => {
          expect(getContagionSourceLabel(mockState, { fromOrganId: 'o1' })).toBe('Desde Corazón');
          expect(getContagionSourceLabel(mockState, { fromOrganId: 'o2' })).toBe('Desde Mutante');
          expect(getContagionSourceLabel(mockState, { fromOrganId: 'o3' })).toBe('Desde órgano o3');
          expect(getContagionSourceLabel(mockState, { fromOrganId: 'o4' })).toBe('Desde ');
          expect(getContagionSourceLabel(mockState, { fromOrganId: 'o5' })).toBe('Desde purple');
      });
  });

  describe('getContagionVirusLabel', () => {
      it('should return virus label with color or unknown', () => {
          expect(getContagionVirusLabel(mockState, { fromOrganId: 'o1' })).toBe('Virus Corazón');
          expect(getContagionVirusLabel(mockState, { fromOrganId: 'o2' })).toBe('Virus Mutante');
          expect(getContagionVirusLabel(mockState, { fromOrganId: 'o3' })).toBe('Virus ???');
          expect(getContagionVirusLabel(mockState, { fromOrganId: 'o4' })).toBe('Virus ');
          expect(getContagionVirusLabel(mockState, { fromOrganId: 'o5' })).toBe('Virus purple');
      });
  });
});

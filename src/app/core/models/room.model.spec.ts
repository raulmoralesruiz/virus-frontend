import { createDefaultRoomConfig } from './room.model';

describe('RoomModel', () => {
  describe('createDefaultRoomConfig', () => {
    it('should return a new instance of default config', () => {
      const config1 = createDefaultRoomConfig();
      const config2 = createDefaultRoomConfig();

      expect(config1).toEqual({
        mode: 'halloween',
        timerSeconds: 60,
      });

      expect(config1).not.toBe(config2); // Should be a new reference
    });
  });
});

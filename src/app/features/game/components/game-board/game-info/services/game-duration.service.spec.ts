import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameDurationService } from './game-duration.service';

describe('GameDurationService', () => {
  let service: GameDurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameDurationService]
    });
    service = TestBed.inject(GameDurationService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.clearDurationTimer();
    jest.useRealTimers();
  });

  it('should initialize with empty duration', () => {
    expect(service.gameDuration()).toBe('');
  });

  it('should set empty duration if startedAt is undefined', () => {
    service.setupDurationTracking(undefined);
    expect(service.gameDuration()).toBe('');
  });

  it('should set empty duration if startedAt is invalid date', () => {
    service.setupDurationTracking('invalid-date-string');
    expect(service.gameDuration()).toBe('');
  });

  it('should set initial duration on setup without winner', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    
    // Start 65 minutes ago (1 hour 5 minutes)
    const startedAt = new Date(now - 65 * 60000).toISOString();
    
    service.setupDurationTracking(startedAt, false);
    
    expect(service.gameDuration()).toBe('01:05');
  });

  it('should update duration repeatedly when interval ticks', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    
    const startedAt = new Date(now).toISOString(); // Started just now
    
    service.setupDurationTracking(startedAt, false);
    expect(service.gameDuration()).toBe('00:00');

    jest.advanceTimersByTime(60000); // 1 minute
    expect(service.gameDuration()).toBe('00:01');
    
    jest.advanceTimersByTime(60000); // 1 minute
    expect(service.gameDuration()).toBe('00:02');
  });

  it('should not start interval if hasWinner is true', () => {
    const now = Date.now();
    jest.setSystemTime(now);
    
    const startedAt = new Date(now - 60000).toISOString(); // 1 minute ago
    
    service.setupDurationTracking(startedAt, true);
    expect(service.gameDuration()).toBe('00:01'); // Initial update works

    jest.advanceTimersByTime(60000); // Try advancing another minute
    // Because hasWinner is true, no interval should have been created
    expect(service.gameDuration()).toBe('00:01'); // Remains 00:01
  });

  it('should handle negative diffMs gracefully (e.g. system time jump)', () => {
      const now = Date.now();
      jest.setSystemTime(now);
      
      const startedAt = new Date(now + 60000).toISOString(); // Started in the future (1 min)
      
      service.setupDurationTracking(startedAt, true);
      
      expect(service.gameDuration()).toBe('00:00'); // Math.max(0, diffMs) limits to 0
  });

  it('should clear duration properly on clearDurationTimer call', () => {
      const now = Date.now();
      jest.setSystemTime(now);
      const startedAt = new Date(now).toISOString();
      
      service.setupDurationTracking(startedAt, false);
      expect(service.gameDuration()).toBe('00:00');
      
      service.clearDurationTimer();
      
      jest.advanceTimersByTime(60000); // Advance time
      // Interval was cleared, so duration should not update
      expect(service.gameDuration()).toBe('00:00');
  });

  it('should not throw on updateGameDuration if startTimestamp is cleared', () => {
    // We emulate a weird state, but setupDurationTracking manages startTimestamp.
    // If we call setupDurationTracking(undefined) it clears it and stops updates.
    const now = Date.now();
    jest.setSystemTime(now);
    const startedAt = new Date(now).toISOString();
    
    service.setupDurationTracking(startedAt, false);
    
    // Now interrupt by clearing
    service.setupDurationTracking(undefined);
    expect(service.gameDuration()).toBe('');
  });

  it('should reset duration if updateGameDuration is called without startTimestamp', () => {
    // Manually force the private method while state is empty
    service.gameDuration.set('12:34'); // fake previous state
    (service as any).updateGameDuration();
    expect(service.gameDuration()).toBe('');
  });
});

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameActionFeedService } from './game-action-feed.service';
import { SocketGameService } from '@core/services/socket/socket.game.service';
import { GameActionParser } from '../parsers/game-action-parser';
import { signal } from '@angular/core';

describe('GameActionFeedService', () => {
  let service: GameActionFeedService;

  const mockSocketGame = {
      publicState: signal<any>(null)
  };
  
  const mockParser = {
      parse: jest.fn((val: string) => ({ id: val, type: 'system' }))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            GameActionFeedService,
            { provide: SocketGameService, useValue: mockSocketGame },
            { provide: GameActionParser, useValue: mockParser }
        ]
    });
    jest.clearAllMocks();
    service = TestBed.inject(GameActionFeedService);
  });

  it('should start with null currentAction', () => {
      expect(service.currentAction()).toBeNull();
  });

  it('should do nothing and clear state if publicState is null', fakeAsync(() => {
      mockSocketGame.publicState.set(null);
      TestBed.flushEffects();
      tick();
      expect(service.currentAction()).toBeNull();
  }));

  it('should initialize on first state emit without queuing existing history', fakeAsync(() => {
      mockSocketGame.publicState.set({ history: ['A', 'B'] });
      TestBed.flushEffects();
      tick();
      expect(service.currentAction()).toBeNull(); // It discards initial history
  }));

  it('should parse and queue new history entries', fakeAsync(() => {
      // 1. Initial State
      mockSocketGame.publicState.set({ history: ['A'] });
      TestBed.flushEffects();
      tick();
      
      // 2. New Event
      mockSocketGame.publicState.set({ history: ['A', 'B', 'B', 'C'] });
      TestBed.flushEffects();
      
      // B (first new), B(second new), C should be queued
      expect(mockParser.parse).toHaveBeenCalledWith('B');
      expect(mockParser.parse).toHaveBeenCalledWith('C');
      
      tick(200); // give it a moment to showNext
      expect(service.currentAction()?.id).toBe('C'); // reverse iterating, last added goes first if you want. Wait, the code reverses: newEntries.reverse(). B, B, C => C, B, B in queue. Next is C.
      
      // Let it process out of the queue (system defaults to 2400)
      tick(2400); 
      expect(service.currentAction()?.id).toBe('B');
      tick(2400);
      expect(service.currentAction()?.id).toBe('B');
      tick(2400);
      expect(service.currentAction()).toBeNull();
  }));

  it('should dismissCurrent when called and advance queue', fakeAsync(() => {
      // Setup initial
      mockSocketGame.publicState.set({ history: [] });
      TestBed.flushEffects();
      tick();

      // Trigger 2 new
      mockSocketGame.publicState.set({ history: ['A', 'B'] });
      TestBed.flushEffects();
      
      // Top of queue is B (due to reverse)
      expect(service.currentAction()?.id).toBe('B');
      
      service.dismissCurrent();
      expect(service.currentAction()?.id).toBe('A');

      service.dismissCurrent();
      expect(service.currentAction()).toBeNull();
  }));

  it('should resolve different durations', fakeAsync(() => {
       mockSocketGame.publicState.set({ history: [] });
       TestBed.flushEffects();
       tick();

       mockParser.parse.mockImplementation((entry: string) => {
           if (entry === '1') return { id: 'long', type: 'play-card', detail: 'yes' } as any;
           if (entry === '2') return { id: 'med', type: 'discard' } as any;
           if (entry === '3') return { id: 'short', type: 'system' } as any;
           return null;
       });

       mockSocketGame.publicState.set({ history: ['1', '2', '3'] });
       TestBed.flushEffects();

       // 3 was pushed first due to reverse(), so short is first. duration: 2400
       expect(service.currentAction()?.id).toBe('short');
       tick(2400);

       // 2 was pushed second so med is next. duration: 3000
       expect(service.currentAction()?.id).toBe('med');
       tick(3000);

       // 1 was pushed last so long is next. duration: 6000
       expect(service.currentAction()?.id).toBe('long');
       tick(6000);

       expect(service.currentAction()).toBeNull();
  }));
});

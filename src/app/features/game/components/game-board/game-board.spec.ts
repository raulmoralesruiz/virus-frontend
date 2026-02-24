import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameBoardComponent } from './game-board';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { GameStoreService } from '@core/services/game-store.service';
import { signal } from '@angular/core';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;

  const mockApiPlayer = { player: signal<any>(null) };
  const mockGameStore = {
      remainingSeconds: signal(60),
      history: signal([]),
      isMyTurn: signal(false),
      clientError: signal('')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardComponent],
      providers: [
          provideHttpClient(), 
          provideHttpClientTesting(),
          { provide: ApiPlayerService, useValue: mockApiPlayer },
          { provide: GameStoreService, useValue: mockGameStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('state', {
      roomId: 'room-1',
      discardCount: 0,
      deckCount: 40,
      cardsDistribution: { hand: 3, deck: 40, discard: 0 },
      players: [],
      startedAt: new Date().toISOString(),
      turnIndex: 0,
      turnDeadlineTs: Date.now(),
      remainingSeconds: 60,
      history: []
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return apiPlayer and gameStore instances', () => {
      expect(component.apiPlayer).toBe(mockApiPlayer);
      expect(component.gameStore).toBe(mockGameStore);
  });

  it('should return meId safely', () => {
      mockApiPlayer.player.set(null);
      expect(component.meId).toBeNull();
      
      mockApiPlayer.player.set({ id: 'my-id' });
      expect(component.meId).toBe('my-id');
  });

  describe('allSlotIds', () => {
      it('should return empty array if no state', () => {
          fixture.componentRef.setInput('state', null);
          expect(component.allSlotIds()).toEqual([]);
      });

      it('should return correct slot ids', () => {
          fixture.componentRef.setInput('state', {
              players: [
                  { 
                      player: { id: 'p1' }, 
                      board: [{ color: 'red' }, { color: 'blue' }] 
                  },
                  { 
                      player: { id: 'p2' }, 
                      board: [{ color: 'green' }] 
                  }
              ]
          } as any);
          
          expect(component.allSlotIds()).toEqual([
              'slot-p1-red',
              'slot-p1-blue',
              'slot-p2-green'
          ]);
      });
  });
});

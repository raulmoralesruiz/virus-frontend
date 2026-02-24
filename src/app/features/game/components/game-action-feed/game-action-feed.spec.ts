import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionFeedComponent } from './game-action-feed';
import { GameActionFeedService } from './services/game-action-feed.service';
import { signal } from '@angular/core';

describe('GameActionFeedComponent', () => {
  let component: GameActionFeedComponent;
  let fixture: ComponentFixture<GameActionFeedComponent>;

  const mockFeed = {
      currentAction: signal<any>(null),
      dismissCurrent: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameActionFeedComponent],
      providers: [
          { provide: GameActionFeedService, useValue: mockFeed }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameActionFeedComponent);
    component = fixture.componentInstance;
    mockFeed.currentAction.set(null);
    fixture.detectChanges();
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
      expect(component.action()).toBeNull();
      expect(component.isVisible()).toBe(false);
      expect(component.isLeaving()).toBe(false);
  });

  it('should react to currentAction and delay visibility', async () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();
      
      expect(component.action()?.id).toBe('a1');
      expect(component.isVisible()).toBe(false);

      // Real async delay
      await new Promise(r => setTimeout(r, 50));
      expect(component.isVisible()).toBe(true);
      expect(component.isLeaving()).toBe(false);
  });

  it('should handle dismissal via space/enter keys', () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');

      component.handleKeydown(enterEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockFeed.dismissCurrent).toHaveBeenCalled();
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      component.handleKeydown(spaceEvent);
      expect(mockFeed.dismissCurrent).toHaveBeenCalledTimes(2);

      const aEvent = new KeyboardEvent('keydown', { key: 'a' });
      component.handleKeydown(aEvent);
      expect(mockFeed.dismissCurrent).toHaveBeenCalledTimes(2); // no change
  });

  it('should do nothing on dismiss if no action displayed', () => {
      component.dismiss();
      expect(mockFeed.dismissCurrent).not.toHaveBeenCalled();
  });

  it('should hide component when currentAction becomes null', async () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 50));
      expect(component.isVisible()).toBe(true);

      mockFeed.currentAction.set(null);
      fixture.detectChanges();

      // Setting visibility to false
      expect(component.isVisible()).toBe(false);
      expect(component.isLeaving()).toBe(true);
  });

  it('should clear display after opacity transition finishes when leaving', async () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 50));
      
      mockFeed.currentAction.set(null);
      fixture.detectChanges();

      expect(component.isLeaving()).toBe(true);

      // Simulate transition end on exactly itself
      const event = new Event('transitionend') as any;
      event.propertyName = 'opacity';
      Object.defineProperty(event, 'target', { value: 'div' });
      Object.defineProperty(event, 'currentTarget', { value: 'div' });
      
      component.handleTransitionEnd(event);
      expect(component.action()).toBeNull();
      expect(component.isLeaving()).toBe(false);
  });
});

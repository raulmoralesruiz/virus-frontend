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

  it('debe ser un <button> nativo (no un div con role="button")', () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();

      const feed = fixture.nativeElement.querySelector('.action-feed');
      expect(feed).toBeTruthy();
      expect(feed.tagName).toBe('BUTTON');
      expect(feed.getAttribute('role')).toBeNull();
      expect(feed.getAttribute('tabindex')).toBeNull();
      // Un botón no puede anidar otro botón (HTML inválido): la "×" es adorno.
      expect(feed.querySelector('button')).toBeNull();
  });

  it('should dismiss on click (Enter/Espacio activan el click del button nativo)', () => {
      mockFeed.currentAction.set({ id: 'a1' });
      fixture.detectChanges();

      const feed = fixture.nativeElement.querySelector('.action-feed') as HTMLButtonElement;
      feed.click();
      expect(mockFeed.dismissCurrent).toHaveBeenCalledTimes(1);
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

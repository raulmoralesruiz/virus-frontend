import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmoteBubblesComponent } from './emote-bubbles.component';
import { EmoteEvent } from '@core/models/game.model';

describe('EmoteBubblesComponent', () => {
  let component: EmoteBubblesComponent;
  let fixture: ComponentFixture<EmoteBubblesComponent>;

  const mkEvent = (id: string, emote: string): EmoteEvent => ({
    id,
    roomId: 'r1',
    playerId: 'p1',
    playerName: 'Alice',
    emote,
    at: Date.now(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmoteBubblesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmoteBubblesComponent);
    component = fixture.componentInstance;
  });

  it('should not render anything when there are no emotes', () => {
    fixture.componentRef.setInput('emotes', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.emote-bubbles')).toBeNull();
  });

  it('should render one bubble per active emote', () => {
    fixture.componentRef.setInput('emotes', [mkEvent('1', '👍'), mkEvent('2', '🔥')]);
    fixture.detectChanges();
    const bubbles = fixture.nativeElement.querySelectorAll('.emote-bubbles__bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[1].textContent).toContain('🔥');
  });

  it('should cap visible bubbles at the last 5', () => {
    const events = Array.from({ length: 8 }, (_, i) => mkEvent(String(i), '🎉'));
    fixture.componentRef.setInput('emotes', events);
    expect(component.visible()).toHaveLength(5);
    // las últimas 5 (los anteriores ya expiraron en el store)
    expect(component.visible()[0].id).toBe('3');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTurnComponent } from './game-turn';

describe('GameTurn', () => {
  let component: GameTurnComponent;
  let fixture: ComponentFixture<GameTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameTurnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTurnComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('state', {
      roomId: 'room1',
      discardCount: 0,
      deckCount: 40,
      players: [],
      startedAt: new Date().toISOString(),
      turnIndex: 0,
      turnDeadlineTs: Date.now(),
      remainingSeconds: 30,
      history: []
    } as any);
    fixture.componentRef.setInput('remainingSeconds', 30);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit timeoutExpired when remaining seconds reaches 0 and is my turn', () => {
    const spy = jest.spyOn(component.timeoutExpired, 'emit');
    fixture.componentRef.setInput('isMyTurn', true);
    fixture.componentRef.setInput('isGameEnded', false);
    fixture.componentRef.setInput('remainingSeconds', 0);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});

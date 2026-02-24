import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerBoardTurnTimerComponent } from './player-board-turn-timer.component';

describe('PlayerBoardTurnTimerComponent', () => {
  let component: PlayerBoardTurnTimerComponent;
  let fixture: ComponentFixture<PlayerBoardTurnTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoardTurnTimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerBoardTurnTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

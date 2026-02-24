import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerBoardTurnProgressComponent } from './player-board-turn-progress.component';

describe('PlayerBoardTurnProgressComponent', () => {
  let component: PlayerBoardTurnProgressComponent;
  let fixture: ComponentFixture<PlayerBoardTurnProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoardTurnProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerBoardTurnProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate turn progress percent correctly', () => {
    fixture.componentRef.setInput('turnDurationSeconds', 30);
    fixture.componentRef.setInput('remainingSeconds', 15);
    expect(component.turnProgressPercent()).toBe(50);

    fixture.componentRef.setInput('remainingSeconds', 0);
    expect(component.turnProgressPercent()).toBe(0);

    fixture.componentRef.setInput('remainingSeconds', 30);
    expect(component.turnProgressPercent()).toBe(100);
  });

  it('should return 0 if duration is 0 or less', () => {
    fixture.componentRef.setInput('turnDurationSeconds', 0);
    fixture.componentRef.setInput('remainingSeconds', 10);
    expect(component.turnProgressPercent()).toBe(0);

    fixture.componentRef.setInput('turnDurationSeconds', -5);
    expect(component.turnProgressPercent()).toBe(0);
  });

  it('should cap progress vertically at 0 and 100', () => {
    fixture.componentRef.setInput('turnDurationSeconds', 30);
    fixture.componentRef.setInput('remainingSeconds', 40); // larger than duration
    expect(component.turnProgressPercent()).toBe(100);

    fixture.componentRef.setInput('remainingSeconds', -10); // less than 0
    expect(component.turnProgressPercent()).toBe(0);
  });
});

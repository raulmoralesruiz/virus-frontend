import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoHistoryComponent } from './game-info-history';

describe('GameInfoHistoryComponent', () => {
  let component: GameInfoHistoryComponent;
  let fixture: ComponentFixture<GameInfoHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameInfoHistoryComponent],
    });
    fixture = TestBed.createComponent(GameInfoHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit historyRequested and stop propagation on click', () => {
    const emitSpy = jest.spyOn(component.historyRequested, 'emit');
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as MouseEvent;

    component.onHistoryClick(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalled();
  });
});

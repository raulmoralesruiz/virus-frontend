import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryComponent } from './game-history.component';
import { ComponentRef } from '@angular/core';

describe('GameHistoryComponent', () => {
  let component: GameHistoryComponent;
  let fixture: ComponentFixture<GameHistoryComponent>;
  let componentRef: ComponentRef<GameHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameHistoryComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('history', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed when clicking close button', () => {
    jest.spyOn(component.closed, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.history-close');
    closeBtn.click();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed when clicking overlay', () => {
    jest.spyOn(component.closed, 'emit');
    const overlay = fixture.nativeElement.querySelector('.history-overlay');
    overlay.click();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should display history entries', () => {
    componentRef.setInput('history', [
      { plainText: 'Test Entry 1' },
      { plainText: 'Test Entry 2' }
    ]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('game-history-item');
    expect(items.length).toBe(2);
  });
});

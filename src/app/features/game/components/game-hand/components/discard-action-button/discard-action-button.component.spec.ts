import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscardActionButtonComponent } from './discard-action-button.component';

describe('DiscardActionButtonComponent', () => {
  let component: DiscardActionButtonComponent;
  let fixture: ComponentFixture<DiscardActionButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiscardActionButtonComponent]
    });
    fixture = TestBed.createComponent(DiscardActionButtonComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('selectedCount', 0);
    fixture.componentRef.setInput('isMyTurn', false);
    fixture.componentRef.setInput('gameEnded', false);
    
    fixture.detectChanges();
  });

  it('should create and verify inputs/outputs are present (for code coverage)', () => {
    expect(component).toBeTruthy();
    expect(component.selectedCount()).toBe(0);
    expect(component.isMyTurn()).toBe(false);
    expect(component.gameEnded()).toBe(false);
  });
});

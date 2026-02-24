import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandCardButtonComponent } from './hand-card-button.component';

describe('HandCardButtonComponent', () => {
  let component: HandCardButtonComponent;
  let fixture: ComponentFixture<HandCardButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HandCardButtonComponent],
    });
    fixture = TestBed.createComponent(HandCardButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should stop propagation and emit action on click', () => {
    const emitSpy = jest.spyOn(component.action, 'emit');
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as MouseEvent;

    component.onClick(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(mockEvent);
  });
});

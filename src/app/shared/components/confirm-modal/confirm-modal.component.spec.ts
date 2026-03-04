import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('description', 'Test Description');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancel event when cancel button is clicked', () => {
    jest.spyOn(component.cancel, 'emit');
    
    const cancelBtn = fixture.nativeElement.querySelector('.confirm-cancel');
    cancelBtn.click();
    
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit confirm event when accept button is clicked', () => {
    jest.spyOn(component.confirm, 'emit');
    
    const acceptBtn = fixture.nativeElement.querySelector('.confirm-accept');
    acceptBtn.click();
    
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should display the correct title and description', () => {
    const titleEl = fixture.nativeElement.querySelector('#confirm-title');
    const descEl = fixture.nativeElement.querySelector('#confirm-description');
    
    expect(titleEl.textContent.trim()).toBe('Test Title');
    expect(descEl.textContent.trim()).toBe('Test Description');
  });

  it('should display default accept and cancel text', () => {
    const cancelBtn = fixture.nativeElement.querySelector('.confirm-cancel');
    const acceptBtn = fixture.nativeElement.querySelector('.confirm-accept');
    
    expect(cancelBtn.textContent.trim()).toBe('Cancelar');
    expect(acceptBtn.textContent.trim()).toBe('Confirmar');
  });

  it('should accept custom accept and cancel text', () => {
    fixture.componentRef.setInput('acceptText', 'Yes');
    fixture.componentRef.setInput('cancelText', 'No');
    fixture.detectChanges();
    
    const cancelBtn = fixture.nativeElement.querySelector('.confirm-cancel');
    const acceptBtn = fixture.nativeElement.querySelector('.confirm-accept');
    
    expect(cancelBtn.textContent.trim()).toBe('No');
    expect(acceptBtn.textContent.trim()).toBe('Yes');
  });
});

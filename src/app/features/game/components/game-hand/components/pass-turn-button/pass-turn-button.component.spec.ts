import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassTurnButtonComponent } from './pass-turn-button.component';

describe('PassTurnButtonComponent', () => {
  let component: PassTurnButtonComponent;
  let fixture: ComponentFixture<PassTurnButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassTurnButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PassTurnButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render «Pasar turno» enabled by default', () => {
    const btn = fixture.nativeElement.querySelector('.pass-btn') as HTMLButtonElement;
    expect(btn.textContent.trim()).toBe('Pasar turno');
    expect(btn.disabled).toBe(false);
  });

  it('should emit pass when clicked', () => {
    const btn = fixture.nativeElement.querySelector('.pass-btn') as HTMLButtonElement;
    const spy = jest.spyOn(component.pass, 'emit');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const spy = jest.spyOn(component.pass, 'emit');
    const btn = fixture.nativeElement.querySelector('.pass-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show the host-provided label (motivo del bloqueo)', () => {
    fixture.componentRef.setInput('label', 'Sin conexión');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.pass-btn') as HTMLButtonElement;
    expect(btn.textContent.trim()).toBe('Sin conexión');
  });
});

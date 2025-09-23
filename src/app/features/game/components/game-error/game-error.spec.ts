import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameErrorComponent } from './game-error';

describe('GameError', () => {
  let component: GameErrorComponent;
  let fixture: ComponentFixture<GameErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed when overlay is clicked', () => {
    component.error = 'Error visible';
    fixture.detectChanges();

    const emitSpy = spyOn(component.closed, 'emit');
    const overlay: HTMLElement | null = fixture.nativeElement.querySelector('.error-overlay');
    expect(overlay).not.toBeNull();
    overlay!.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit closed when close button is clicked', () => {
    component.error = 'Error visible';
    fixture.detectChanges();

    const emitSpy = spyOn(component.closed, 'emit');
    const closeButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.error-close');
    expect(closeButton).not.toBeNull();
    closeButton!.click();

    expect(emitSpy).toHaveBeenCalled();
  });
});

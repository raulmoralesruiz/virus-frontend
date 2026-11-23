import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHelpComponent } from './game-help.component';

describe('GameHelpComponent', () => {
  let component: GameHelpComponent;
  let fixture: ComponentFixture<GameHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHelpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the «?» toggle and no dialog by default', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-label')).toContain('Ayuda');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.help-modal')).toBeFalsy();
  });

  it('should open the dialog and mark the toggle as expanded', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(component.open).toBe(true);
    const dialog = fixture.nativeElement.querySelector('.help-modal') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('should close via the ✕ button', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const close = fixture.nativeElement.querySelector('.help-close') as HTMLButtonElement;
    close.click();
    fixture.detectChanges();
    expect(component.open).toBe(false);
    expect(fixture.nativeElement.querySelector('.help-modal')).toBeFalsy();
  });

  it('should close on Escape (focus trap)', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('.help-modal') as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(component.open).toBe(false);
  });

  it('should summarize the core rules', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('4 órganos sanos de colores distintos');
    expect(text).toContain('60 s');
    expect(text).toContain('Aparición');
  });

  it('should link to the full rules', () => {
    const toggle = fixture.nativeElement.querySelector('.help-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.help-link') as HTMLAnchorElement;
    expect(link.href).toContain('virusdocs.raulmorales.eu/guides/game-mechanics');
    expect(link.target).toBe('_blank');
  });
});

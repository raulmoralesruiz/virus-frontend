import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PlayerBoardEmptyComponent } from './player-board-empty.component';

describe('PlayerBoardEmptyComponent', () => {
  let fixture: ComponentFixture<PlayerBoardEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoardEmptyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerBoardEmptyComponent);
    fixture.detectChanges();
  });

  it('debe mostrar 4 huecos, uno por órgano, con su icono', () => {
    const slots = fixture.debugElement.queryAll(By.css('.board-empty__slot'));
    expect(slots).toHaveLength(4);

    const icons = fixture.debugElement.queryAll(By.css('.board-empty__icon'));
    expect(icons).toHaveLength(4);

    const uses = fixture.nativeElement.querySelectorAll('use');
    expect(Array.from(uses).map(u => u.getAttribute('href'))).toEqual([
      '#icon-organ-red',
      '#icon-organ-green',
      '#icon-organ-blue',
      '#icon-organ-yellow',
    ]);
  });

  it('debe ocultar el grid a lectores de pantalla y ofrecer una etiqueta equivalente', () => {
    const grid = fixture.debugElement.query(By.css('.board-empty__grid'));
    expect(grid.nativeElement.getAttribute('aria-hidden')).toBe('true');

    const srOnly = fixture.nativeElement.querySelector('.sr-only');
    expect(srOnly.textContent).toContain('4 órganos por repartir');
  });

  it('no debe mostrar texto visible', () => {
    const visibleText = fixture.nativeElement
      .querySelector('.board-empty__grid')
      .textContent.replace(/\s+/g, ' ')
      .trim();
    expect(visibleText).toBe('');
  });

  it('debe activar la clase is-active cuando isActive es true', () => {
    expect(fixture.nativeElement.classList.contains('is-active')).toBe(false);

    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('is-active')).toBe(true);
  });
});

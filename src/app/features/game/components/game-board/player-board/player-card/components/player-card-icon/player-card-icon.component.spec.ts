import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PlayerCardIconComponent } from './player-card-icon.component';
import { CardColor } from '@core/models/card.model';
import { OrganOnBoard } from '@core/models/game.model';

describe('PlayerCardIconComponent', () => {
  let fixture: ComponentFixture<PlayerCardIconComponent>;

  const createFixture = (color: CardColor) => {
    TestBed.configureTestingModule({
      imports: [PlayerCardIconComponent],
    });
    const f = TestBed.createComponent(PlayerCardIconComponent);
    f.componentRef.setInput(
      'organ',
      { id: 'organ-1', kind: 'organ', color, attached: [] } as OrganOnBoard
    );
    f.detectChanges();
    return f;
  };

  it('debe renderizar el icono del órgano', () => {
    fixture = createFixture(CardColor.Red);
    const icon = fixture.debugElement.query(By.css('card-icon'));
    expect(icon).toBeTruthy();
  });

  // Icono uniforme (negro) sobre los fondos de todos los órganos en tablero
  it.each([
    CardColor.Red,
    CardColor.Green,
    CardColor.Blue,
    CardColor.Yellow,
    CardColor.Multi,
    CardColor.Orange,
    CardColor.Halloween,
  ])('debe usar el color de icono negro uniforme para el órgano %s', (color) => {
    fixture = createFixture(color);
    const icon = fixture.debugElement.query(By.css('card-icon'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.style.color).toBe('rgb(0, 0, 0)');
  });
});

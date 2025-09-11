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
});

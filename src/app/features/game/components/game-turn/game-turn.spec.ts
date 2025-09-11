import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTurnComponent } from './game-turn';

describe('GameTurn', () => {
  let component: GameTurnComponent;
  let fixture: ComponentFixture<GameTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameTurnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

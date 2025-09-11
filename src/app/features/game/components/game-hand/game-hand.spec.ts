import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHandComponent } from './game-hand';

describe('GameHand', () => {
  let component: GameHandComponent;
  let fixture: ComponentFixture<GameHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHandComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

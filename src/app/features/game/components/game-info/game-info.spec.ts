import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInfoComponent } from './game-info';

describe('GameInfo', () => {
  let component: GameInfoComponent;
  let fixture: ComponentFixture<GameInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

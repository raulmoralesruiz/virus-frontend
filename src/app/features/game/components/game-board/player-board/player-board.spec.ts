import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerBoard } from './player-board';

describe('PlayerBoard', () => {
  let component: PlayerBoard;
  let fixture: ComponentFixture<PlayerBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

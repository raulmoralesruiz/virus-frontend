import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandCard } from './hand-card';

describe('HandCard', () => {
  let component: HandCard;
  let fixture: ComponentFixture<HandCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

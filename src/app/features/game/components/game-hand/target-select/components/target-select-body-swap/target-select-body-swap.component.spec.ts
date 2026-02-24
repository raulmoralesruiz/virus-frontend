import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetSelectBodySwapComponent } from './target-select-body-swap.component';

describe('TargetSelectBodySwapComponent', () => {
  let component: TargetSelectBodySwapComponent;
  let fixture: ComponentFixture<TargetSelectBodySwapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TargetSelectBodySwapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetSelectBodySwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

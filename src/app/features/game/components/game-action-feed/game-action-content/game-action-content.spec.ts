import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionContentComponent } from './game-action-content';

describe('GameActionContentComponent', () => {
  let component: GameActionContentComponent;
  let fixture: ComponentFixture<GameActionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameActionContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameActionContentComponent);
    component = fixture.componentInstance;
  });

  it('should emit on dismiss', () => {
    jest.spyOn(component.dismiss, 'emit');
    component.onDismiss();
    expect(component.dismiss.emit).toHaveBeenCalled();
  });
});

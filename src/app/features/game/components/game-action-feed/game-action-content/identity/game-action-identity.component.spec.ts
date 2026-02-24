import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameActionIdentityComponent } from './game-action-identity.component';

describe('GameActionIdentityComponent', () => {
  let component: GameActionIdentityComponent;
  let fixture: ComponentFixture<GameActionIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameActionIdentityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameActionIdentityComponent);
    component = fixture.componentInstance;
  });

  it('should set actor input', () => {
    fixture.componentRef.setInput('actor', 'Player1');
    fixture.detectChanges();
    expect(component.actor()).toBe('Player1');
  });
});

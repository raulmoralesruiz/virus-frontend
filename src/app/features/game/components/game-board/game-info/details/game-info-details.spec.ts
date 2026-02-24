import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoDetailsComponent } from './game-info-details';

describe('GameInfoDetailsComponent', () => {
  let component: GameInfoDetailsComponent;
  let fixture: ComponentFixture<GameInfoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameInfoDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should emit leaveRequested', () => {
      jest.spyOn(component.leaveRequested, 'emit');
      component.onLeaveRequested();
      expect(component.leaveRequested.emit).toHaveBeenCalled();
  });

  it('should emit muteToggled', () => {
      jest.spyOn(component.muteToggled, 'emit');
      component.onMuteToggled();
      expect(component.muteToggled.emit).toHaveBeenCalled();
  });

  it('should emit themeToggled', () => {
      jest.spyOn(component.themeToggled, 'emit');
      component.onThemeToggled();
      expect(component.themeToggled.emit).toHaveBeenCalled();
  });

  it('should emit fullscreenToggled', () => {
      jest.spyOn(component.fullscreenToggled, 'emit');
      component.onFullscreenToggled();
      expect(component.fullscreenToggled.emit).toHaveBeenCalled();
  });
});

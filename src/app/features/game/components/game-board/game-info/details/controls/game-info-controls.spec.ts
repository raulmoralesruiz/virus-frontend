import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameInfoControlsComponent } from './game-info-controls';

describe('GameInfoControlsComponent', () => {
  let component: GameInfoControlsComponent;
  let fixture: ComponentFixture<GameInfoControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfoControlsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameInfoControlsComponent);
    component = fixture.componentInstance;
  });

  it('should emit leaveRequested', () => {
      jest.spyOn(component.leaveRequested, 'emit');
      component.onLeaveClick();
      expect(component.leaveRequested.emit).toHaveBeenCalled();
  });

  it('should emit muteToggled and stop propagation', () => {
      jest.spyOn(component.muteToggled, 'emit');
      const event = new MouseEvent('click');
      const stopPropSpy = jest.spyOn(event, 'stopPropagation');
      
      component.onMuteToggle(event);
      
      expect(component.muteToggled.emit).toHaveBeenCalled();
      expect(stopPropSpy).toHaveBeenCalled();
  });

  it('should emit themeToggled and stop propagation', () => {
      jest.spyOn(component.themeToggled, 'emit');
      const event = new MouseEvent('click');
      const stopPropSpy = jest.spyOn(event, 'stopPropagation');
      
      component.onThemeToggle(event);
      
      expect(component.themeToggled.emit).toHaveBeenCalled();
      expect(stopPropSpy).toHaveBeenCalled();
  });

  it('should emit fullscreenToggled and stop propagation', () => {
      jest.spyOn(component.fullscreenToggled, 'emit');
      const event = new MouseEvent('click');
      const stopPropSpy = jest.spyOn(event, 'stopPropagation');
      
      component.onFullscreenToggle(event);
      
      expect(component.fullscreenToggled.emit).toHaveBeenCalled();
      expect(stopPropSpy).toHaveBeenCalled();
  });
});

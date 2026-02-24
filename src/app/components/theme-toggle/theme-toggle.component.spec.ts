import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '@core/services/theme.service';
import { signal } from '@angular/core';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceMock: any;

  beforeEach(() => {
    themeServiceMock = {
      isDark: signal(false),
      toggleTheme: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    });
    
    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and get isDark from themeService', () => {
    expect(component).toBeTruthy();
    expect(component.isDark()).toBe(false);
  });

  it('should call toggleTheme on the service when toggle is called', () => {
    component.toggle();
    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
  });
});

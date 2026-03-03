import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoomLogoutComponent } from './room-logout.component';
import { CardIconComponent } from '@app/shared/components/card-icon/card-icon.component';

describe('RoomLogoutComponent', () => {
  let component: RoomLogoutComponent;
  let fixture: ComponentFixture<RoomLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomLogoutComponent, CardIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set showConfirmModal to true on logout()', () => {
    component.logout();
    expect(component.showConfirmModal()).toBe(true);
  });

  it('should hide modal on cancelLogout()', () => {
    component.logout();
    component.cancelLogout();
    expect(component.showConfirmModal()).toBe(false);
  });

  it('should clear localStorage and call redirect() on confirmLogout()', () => {
    localStorage.setItem('player', 'test');
    jest.spyOn(component, 'redirect').mockImplementation(() => {});
    
    component.confirmLogout();

    expect(localStorage.getItem('player')).toBeNull();
    expect(component.redirect).toHaveBeenCalled();
  });
});

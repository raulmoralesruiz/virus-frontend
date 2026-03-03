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

  it('should clear localStorage and call redirect() on logout()', () => {
    localStorage.setItem('player', 'test');
    jest.spyOn(component, 'redirect').mockImplementation(() => {});
    
    component.logout();

    expect(localStorage.getItem('player')).toBeNull();
    expect(component.redirect).toHaveBeenCalled();
  });
});

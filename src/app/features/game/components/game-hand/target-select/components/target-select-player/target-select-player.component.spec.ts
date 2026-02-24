import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetSelectPlayerComponent } from './target-select-player.component';
import { ComponentRef } from '@angular/core';

describe('TargetSelectPlayerComponent', () => {
  let component: TargetSelectPlayerComponent;
  let fixture: ComponentFixture<TargetSelectPlayerComponent>;
  let componentRef: ComponentRef<TargetSelectPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TargetSelectPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetSelectPlayerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('playerOptions', [{ id: '1', name: 'p1' }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit playerChange when handlePlayerChange is called', () => {
    jest.spyOn(component.playerChange, 'emit');
    component.handlePlayerChange('p1');
    expect(component.playerChange.emit).toHaveBeenCalledWith('p1');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetSelectTransplantComponent } from './target-select-transplant.component';
import { ComponentRef } from '@angular/core';

describe('TargetSelectTransplantComponent', () => {
  let component: TargetSelectTransplantComponent;
  let fixture: ComponentFixture<TargetSelectTransplantComponent>;
  let componentRef: ComponentRef<TargetSelectTransplantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TargetSelectTransplantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetSelectTransplantComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('playerOptions', [{ id: '1', name: 'p1' }]);
    componentRef.setInput('targetOptions', [{ playerId: '1', organId: 'o1', organColor: 'red' }, { playerId: '2', organId: 'o2' }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle player change', () => {
    jest.spyOn(component.playerChange, 'emit');
    component.handlePlayerChange('1', 'A');
    expect(component.playerChange.emit).toHaveBeenCalledWith({ playerId: '1', which: 'A' });
  });

  it('should select organ', () => {
    jest.spyOn(component.targetChange, 'emit');
    component.selectOrgan({ playerId: '1', organId: 'o1', organColor: 'red' }, 'B');
    expect(component.targetChange.emit).toHaveBeenCalledWith({ value: 'o1|1', which: 'B' });
    
    // Ignore if no organId
    component.targetChange.emit = jest.fn();
    component.selectOrgan({ playerId: '1' } as any, 'B');
    expect(component.targetChange.emit).not.toHaveBeenCalled();
  });

  it('should format option value', () => {
    expect(component.toOptionValue({ organId: 'o1', playerId: 'p1' } as any)).toBe('o1|p1');
    expect(component.toOptionValue(null)).toBe('');
  });

  it('should get organs for player', () => {
    expect(component.organsForPlayer('1')).toEqual([{ playerId: '1', organId: 'o1', organColor: 'red' }]);
    expect(component.organsForPlayer('')).toEqual([]);
  });

  it('should map color class and label', () => {
    expect(component.organColorClass('red')).toBe('color-dot--red');
    expect(component.organColorClass('green')).toBe('color-dot--green');
    expect(component.organColorClass('blue')).toBe('color-dot--blue');
    expect(component.organColorClass('yellow')).toBe('color-dot--yellow');
    expect(component.organColorClass('multi')).toBe('color-dot--multi');
    expect(component.organColorClass('unknown')).toBe('color-dot--neutral');
    expect(component.organColorClass()).toBe('color-dot--neutral');
    
    expect(component.organColorLabel('red')).toBe('Corazón');
    expect(component.organColorLabel('multi')).toBe('Multicolor');
    expect(component.organColorLabel('unknown')).toBe('unknown');
    expect(component.organColorLabel()).toBe('Sin órgano');
  });
});

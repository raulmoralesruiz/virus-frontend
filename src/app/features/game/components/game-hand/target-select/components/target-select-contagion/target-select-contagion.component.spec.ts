import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TargetSelectContagionComponent } from './target-select-contagion.component';
import { ComponentRef } from '@angular/core';

describe('TargetSelectContagionComponent', () => {
  let component: TargetSelectContagionComponent;
  let fixture: ComponentFixture<TargetSelectContagionComponent>;
  let componentRef: ComponentRef<TargetSelectContagionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TargetSelectContagionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetSelectContagionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('contagionAssignments', [{ fromOrganId: 'o1', toOrganId: '', toPlayerId: '' }]);
    componentRef.setInput('publicState', null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle player change', () => {
    jest.spyOn(component.contagionTargetChange, 'emit');
    component.handleContagionPlayerChange('p1', 0);
    expect(component.contagionTargetChange.emit).toHaveBeenCalledWith({ value: '|p1', index: 0 });
    
    component.handleContagionPlayerChange('', 1);
    expect(component.contagionTargetChange.emit).toHaveBeenCalledWith({ value: '', index: 1 });
  });

  it('should select organ', () => {
    jest.spyOn(component.contagionTargetChange, 'emit');
    component.selectContagionOrgan({ playerId: 'p1', organId: 'o2' }, 0);
    expect(component.contagionTargetChange.emit).toHaveBeenCalledWith({ value: 'o2|p1', index: 0 });

    component.contagionTargetChange.emit = jest.fn();
    component.selectContagionOrgan({ playerId: 'p1' }, 0);
    expect(component.contagionTargetChange.emit).not.toHaveBeenCalled();
    
    component.selectContagionOrgan({ organId: 'o2' } as any, 0);
    expect(component.contagionTargetChange.emit).not.toHaveBeenCalled();
  });

  it('should format contagion selection value', () => {
    expect(component.contagionSelectionValue({ toOrganId: 'o2', toPlayerId: 'p2' } as any)).toBe('o2|p2');
    expect(component.contagionSelectionValue({ toOrganId: '', toPlayerId: 'p1' } as any)).toBe('');
    expect(component.contagionSelectionValue({ toOrganId: 'o1', toPlayerId: '' } as any)).toBe('');
  });

  it('should delegate to utils', () => {
    expect(component.toOptionValue({ organId: 'o1', playerId: 'p1' })).toBe('o1|p1');
    expect(component.contagionPlayerOptions).toEqual([]);
    expect(component.contagionSourceLabel({ fromOrganId: 'x', toOrganId: '', toPlayerId: '' })).toBe('Desde órgano x');
    expect(component.contagionVirusLabel({ fromOrganId: 'x', toOrganId: '', toPlayerId: '' })).toBe('Virus ???');
    expect(component.contagionOrgansForPlayer('p1')).toEqual([]);
    expect(component.organColorClass('red')).toBe('color-dot--red');
    expect(component.organColorLabel('red')).toBe('Corazón');
  });
});

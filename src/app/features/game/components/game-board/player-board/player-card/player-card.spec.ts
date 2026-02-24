import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCardComponent } from './player-card';
import { DragDropService } from '@core/services/drag-drop.service';
import { signal } from '@angular/core';

describe('PlayerCard', () => {
  let component: PlayerCardComponent;
  let fixture: ComponentFixture<PlayerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('organ', { id: 'organ-1', name: 'Corazón', attached: [] } as any);
    fixture.componentRef.setInput('dropListId', 'some-id');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set drag drop service dragged item on virus drag start', () => {
    const service = TestBed.inject(DragDropService);
    const setSpy = jest.spyOn(service.draggedItem, 'set');
    const mockVirus = { id: 'v1' } as any;
    
    component.onVirusDragStarted(mockVirus);
    
    expect(setSpy).toHaveBeenCalledWith({
      fromOrganId: 'organ-1',
      virusId: 'v1',
      virus: mockVirus,
      kind: 'virus-token'
    });
  });

  it('should clear dragged item on virus drag end', () => {
    const service = TestBed.inject(DragDropService);
    const setSpy = jest.spyOn(service.draggedItem, 'set');
    
    component.onVirusDragEnded();
    
    expect(setSpy).toHaveBeenCalledWith(null);
  });

  it('should get all attached cards correctly', () => {
    fixture.componentRef.setInput('organ', { id: 'o1', name: 'Organ', attached: [{ id: 'v1' }] } as any);
    fixture.componentRef.setInput('temporaryViruses', [{ id: 'v2' }] as any);
    expect(component.getAllAttachedCards().length).toBe(2);
  });

  it('should handle undefined attached and temporaryViruses arrays', () => {
    fixture.componentRef.setInput('organ', { id: 'o1', name: 'Organ' } as any);
    fixture.componentRef.setInput('temporaryViruses', undefined as any);
    expect(component.getAllAttachedCards().length).toBe(0);
  });


  it('should handle drop list events', () => {
    // Force a valid target for drag over logic
    const service = TestBed.inject(DragDropService);
    service.draggedItem.set({ virusId: 'v1', virus: { id: 'v1', color: 'red'} as any} as any);
    fixture.componentRef.setInput('organ', { color: 'red', attached: [] } as any);
    fixture.componentRef.setInput('isMe', true);
    
    component.onDragEntered();
    expect(component.isDragOver()).toBe(true);
    
    component.onDragExited();
    expect(component.isDragOver()).toBe(false);
    
    component.onDragEntered();
    component.onDropped();
    expect(component.isDragOver()).toBe(false);
  });

  it('should not set isDragOver to true if target is invalid on drag enter', () => {
    const service = TestBed.inject(DragDropService);
    service.draggedItem.set(null); // Invalid target
    
    component.onDragEntered();
    expect(component['_isDragOver']()).toBe(false);
  });

  it('should reset isDragOver when draggedItem becomes null', () => {
    jest.useFakeTimers();
    const service = TestBed.inject(DragDropService);
    
    service.draggedItem.set({ virusId: 'v1', virus: { id: 'v1', color: 'red'} as any} as any);
    component['_isDragOver'].set(true);
    fixture.detectChanges();

    service.draggedItem.set(null);
    fixture.detectChanges(); 
    jest.runAllTimers(); 

    expect(component['_isDragOver']()).toBe(false);
    jest.useRealTimers();
  });
});

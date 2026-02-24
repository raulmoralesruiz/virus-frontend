import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandCard } from './hand-card';
import { DragDropService } from '@core/services/drag-drop.service';
import { Card } from '@core/models/card.model';
import { signal } from '@angular/core';

describe('HandCard', () => {
  let component: HandCard;
  let fixture: ComponentFixture<HandCard>;
  let dragDropServiceMock: any;
  let mockCard: Card;

  beforeEach(async () => {
    mockCard = { id: 'card-1', kind: 'organ', color: 'red' } as Card;
    dragDropServiceMock = {
      draggedItem: signal<Card | null>(null)
    };

    await TestBed.configureTestingModule({
      imports: [HandCard],
      providers: [
        { provide: DragDropService, useValue: dragDropServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', mockCard);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset draggedItem in effect if disabled and this card is dragged', () => {
    dragDropServiceMock.draggedItem.set(mockCard);
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges(); // trigger effect
    expect(dragDropServiceMock.draggedItem()).toBeNull();
  });

  it('should emit toggleSelect if it is my turn and not disabled', () => {
    const emitSpy = jest.spyOn(component.toggleSelect, 'emit');
    
    component.onToggleSelect();
    expect(emitSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('isMyTurn', true);
    fixture.componentRef.setInput('isDisabled', true);
    component.onToggleSelect();
    expect(emitSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('isDisabled', false);
    component.onToggleSelect();
    expect(emitSpy).toHaveBeenCalledWith(mockCard);
  });

  it('should emit play', () => {
    const emitSpy = jest.spyOn(component.play, 'emit');
    component.onPlay();
    expect(emitSpy).toHaveBeenCalledWith(mockCard);
  });

  it('should set dragged item on drag start', () => {
    component.onDragStarted();
    expect(dragDropServiceMock.draggedItem()).toEqual(mockCard);
  });

  it('should clear dragged item on drag end', () => {
    dragDropServiceMock.draggedItem.set(mockCard);
    component.onDragEnded();
    expect(dragDropServiceMock.draggedItem()).toBeNull();
  });

  it('should clear dragged item on destroy if it is the dragged item', () => {
    dragDropServiceMock.draggedItem.set(mockCard);
    component.ngOnDestroy();
    expect(dragDropServiceMock.draggedItem()).toBeNull();
  });

  it('should not clear dragged item on destroy if it is not the dragged item', () => {
    const otherCard = { id: 'card-2' } as Card;
    dragDropServiceMock.draggedItem.set(otherCard);
    component.ngOnDestroy();
    expect(dragDropServiceMock.draggedItem()).toEqual(otherCard);
  });

  describe('computed properties', () => {
    it('should compute container classes for standard organ', () => {
      expect(component.containerClasses()).toContain('hand-card--red');
      expect(component.containerClasses()).toContain('hand-card--organ');
    });

    it('should compute container classes for halloween treatment', () => {
      fixture.componentRef.setInput('card', { kind: 'treatment', color: 'halloween' } as Card);
      expect(component.containerClasses()).toContain('hand-card--treatment-halloween');
    });

    it('should compute status classes based on inputs', () => {
      fixture.componentRef.setInput('isSelected', true);
      fixture.componentRef.setInput('isMyTurn', true);
      fixture.componentRef.setInput('isDisabled', true);
      fixture.componentRef.setInput('isPlaying', true);
      
      const classes = component.containerClasses();
      expect(classes).toContain('is-selected');
      expect(classes).toContain('is-my-turn');
      expect(classes).toContain('disabled');
      expect(classes).toContain('is-playing');
    });

    it('should compute actionLabel based on state', () => {
      expect(component.actionLabel()).toBe('Info');
      
      fixture.componentRef.setInput('infoOpen', true);
      expect(component.actionLabel()).toBe('Cancelar');
      
      fixture.componentRef.setInput('isMyTurn', true);
      expect(component.actionLabel()).toBe('Jugar');
      
      fixture.componentRef.setInput('isDisabled', true);
      expect(component.actionLabel()).toBe('...');
    });
  });
});

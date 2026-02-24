import { DragDropService } from './drag-drop.service';
import { TestBed } from '@angular/core/testing';

describe('DragDropService', () => {
  let service: DragDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get and set hand list ids', () => {
    expect(service.handListId('p1')).toBeNull();
    service.setHandListId('p1', 'hand-p1');
    expect(service.handListId('p1')).toBe('hand-p1');
  });

  it('should get and set board list ids', () => {
    expect(service.boardListId('p1')).toBeNull();
    service.setBoardListId('p1', 'board-p1');
    expect(service.boardListId('p1')).toBe('board-p1');
  });

  it('should manage dragged item state', () => {
    expect(service.draggedItem()).toBeNull();
    service.draggedItem.set({ id: 'item1' });
    expect(service.draggedItem()).toEqual({ id: 'item1' });
  });
});

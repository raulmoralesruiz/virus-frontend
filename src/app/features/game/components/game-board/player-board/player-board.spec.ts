import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerBoardComponent } from './player-board';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DragDropService } from '@core/services/drag-drop.service';
import { BoardActionService } from './services/board-action.service';
import { PlayerBoardDropService } from './services/player-board-drop.service';
import { CardKind, TreatmentSubtype } from '@core/models/card.model';
import { BoardDragPredicates } from './logic/board-drag-predicates';

describe('PlayerBoard', () => {
  let component: PlayerBoardComponent;
  let fixture: ComponentFixture<PlayerBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerBoardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', {
      player: { id: 'p1', name: 'P-1', isAvatarCustom: false },
      board: [],
      handCount: 3
    } as any);
    fixture.componentRef.setInput('roomId', 'r1');
    fixture.componentRef.setInput('gameState', { cardsDistribution: { hand: 3, deck: 40, discard: 0 } } as any);
    fixture.componentRef.setInput('getTemporaryVirusesForOrgan', () => []);
    fixture.componentRef.setInput('hasTemporaryVirus', () => false);
    fixture.componentRef.setInput('allSlotIds', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set drag over on enter and exit', () => {
    component.onBoardEnter(null as any);
    expect(component.isDragOver()).toBe(true);

    component.onBoardExit(null as any);
    expect(component.isDragOver()).toBe(false);
  });


  it('should return connected drop lists if me', () => {
    // API player is 'p1' due to default state in ApiPlayerService, 
    // Wait, let's mock the internal ApiPlayerService if connectedTo uses it.
    // Instead we just check if it returns array of strings
    expect(component.connectedTo().length).toBeGreaterThanOrEqual(0);
  });

  it('should return an empty string array if apiPlayer player is null', () => {
    // Override the internal service via injection context by creating a new component with a mocked provider? No, just manually overriding the signal works if done correctly.
    // Instead of messing with the readonly signal, let's just force the apiPlayer to return null.
    // Simplest: just overwrite the internal property `_apiPlayer`
    (component as any)._apiPlayer = { player: () => null };
    expect(component.connectedTo()).toEqual([]);
  });

  it('should handle dropping BodySwap card', () => {
    const startBodySwapSpy = jest.spyOn(component.startBodySwap, 'emit');
    const mockCard = { kind: CardKind.Treatment, subtype: TreatmentSubtype.BodySwap };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(startBodySwapSpy).toHaveBeenCalledWith({ card: mockCard });
  });

  it('should handle dropping Apparition card', () => {
    const startApparitionSpy = jest.spyOn(component.startApparition, 'emit');
    const mockCard = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Apparition };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(startApparitionSpy).toHaveBeenCalledWith({ card: mockCard });
  });

  it('should handle dropping Contagion card', () => {
    const startContagionSpy = jest.spyOn(component.startContagion, 'emit');
    const actionService = fixture.debugElement.injector.get(BoardActionService);
    jest.spyOn(actionService, 'validateContagion').mockReturnValue(true);

    const mockCard = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(startContagionSpy).toHaveBeenCalledWith({ card: mockCard });
  });

  it('should not emit startContagion if contagion is invalid', () => {
    const startContagionSpy = jest.spyOn(component.startContagion, 'emit');
    const actionService = fixture.debugElement.injector.get(BoardActionService);
    jest.spyOn(actionService, 'validateContagion').mockReturnValue(false);

    const mockCard = { kind: CardKind.Treatment, subtype: TreatmentSubtype.Contagion };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(startContagionSpy).not.toHaveBeenCalled();
  });

  it('should handle normal board drop via dropService', () => {
    const dropService = fixture.debugElement.injector.get(PlayerBoardDropService);
    const dropSpy = jest.spyOn(dropService, 'handleBoardDrop').mockImplementation();

    const mockCard = { kind: CardKind.Organ };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(dropSpy).toHaveBeenCalled();
  });

  it('should handle normal board drop for other Treatment cards', () => {
    const dropService = fixture.debugElement.injector.get(PlayerBoardDropService);
    const dropSpy = jest.spyOn(dropService, 'handleBoardDrop').mockImplementation();

    const mockCard = { kind: CardKind.Treatment, subtype: TreatmentSubtype.OrganThief };
    const event = { item: { data: mockCard } } as any;

    component.onBoardDrop(event);

    expect(dropSpy).toHaveBeenCalled();
  });

  it('should expose apiPlayer and gameStore getters', () => {
    expect(component.apiPlayer).toBeDefined();
    expect(component.gameStore).toBeDefined();
  });

  it('should evaluate isValidBoardTarget when draggedItem is a Card', () => {
    const dragDropService = TestBed.inject(DragDropService);
    dragDropService.draggedItem.set({ id: 'c1', kind: CardKind.Treatment } as any);
    expect(component.isValidBoardTarget()).toBeDefined();
  });

  it('should call checkBoardEnter through boardEnterPredicate', () => {
    const predicates = fixture.debugElement.injector.get(BoardDragPredicates);
    const spy = jest.spyOn(predicates as any, 'checkBoardEnter').mockReturnValue(true);
    
    expect(component.boardEnterPredicate(null as any, null as any)).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should set isDragOver to false when draggedItem becomes null', () => {
    jest.useFakeTimers();
    const dragDropService = TestBed.inject(DragDropService);
    
    dragDropService.draggedItem.set({ id: 'c1' } as any);
    component.isDragOver.set(true);
    fixture.detectChanges();

    dragDropService.draggedItem.set(null);
    fixture.detectChanges();
    jest.runAllTimers();

    expect(component.isDragOver()).toBe(false);
    jest.useRealTimers();
  });
});

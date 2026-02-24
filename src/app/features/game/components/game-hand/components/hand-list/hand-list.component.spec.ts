import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandListComponent } from './hand-list.component';

describe('HandListComponent', () => {
  let component: HandListComponent;
  let fixture: ComponentFixture<HandListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HandListComponent]
    });
    fixture = TestBed.createComponent(HandListComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('hand', []);
    fixture.detectChanges();
  });

  it('should create and verify component initializes properties for coverage', () => {
    expect(component).toBeTruthy();
    expect(component.hand()).toEqual([]);
    expect(component.isMyTurn()).toBe(false);
    expect(component.playerId()).toBeUndefined();
    expect(component.connectedTo()).toEqual([]);
    expect(component.selectedIndices().size).toBe(0);
    expect(component.selectedPlayingCardId()).toBeUndefined();
    expect(component.mustPlayCardId()).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandListComponent } from './hand-list.component';
import { HandMotionService } from '@core/services/hand-motion.service';
import { Card, CardColor, CardKind } from '@core/models/card.model';

describe('HandListComponent', () => {
  let component: HandListComponent;
  let fixture: ComponentFixture<HandListComponent>;
  let motion: HandMotionService;

  const makeCard = (id: string, color: CardColor = CardColor.Red, kind: CardKind = CardKind.Organ): Card => ({
    id,
    color,
    kind,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HandListComponent]
    });
    fixture = TestBed.createComponent(HandListComponent);
    component = fixture.componentInstance;
    motion = TestBed.inject(HandMotionService);
    motion.reset();

    fixture.componentRef.setInput('hand', []);
    fixture.detectChanges();
  });

  afterEach(() => {
    motion.reset();
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

  describe('render', () => {
    it('should render one app-hand-card per live card (sin ghost cuando no hay salida)', () => {
      fixture.componentRef.setInput('hand', [makeCard('a'), makeCard('b')]);
      fixture.detectChanges();

      expect(component.renderHand().map((c) => c.id)).toEqual(['a', 'b']);
      expect(fixture.nativeElement.querySelectorAll('app-hand-card')).toHaveLength(2);
      expect(fixture.nativeElement.querySelectorAll('.hand-card--ghost')).toHaveLength(0);
    });

    it('should render la saliente como ghost inerte sobre la foto de layout', () => {
      const hand = [makeCard('a'), makeCard('b'), makeCard('c')];
      fixture.componentRef.setInput('hand', hand);
      fixture.detectChanges();

      // La mano viva ya perdió la carta "b", pero la foto de layout la sostiene
      fixture.componentRef.setInput('hand', [makeCard('a'), makeCard('c')]);
      motion.markLeaving(hand, ['b']);
      fixture.detectChanges();

      expect(component.renderHand().map((c) => c.id)).toEqual(['a', 'b', 'c']);
      expect(fixture.nativeElement.querySelectorAll('app-hand-card')).toHaveLength(2);
      expect(fixture.nativeElement.querySelectorAll('.hand-card--ghost')).toHaveLength(1);
    });

    it('should sostener el ghost hasta el auto-cleanup, y luego renderizar la mano viva', () => {
      jest.useFakeTimers();
      const hand = [makeCard('a'), makeCard('b')];
      fixture.componentRef.setInput('hand', hand);
      fixture.detectChanges();

      motion.markLeaving(hand, ['b']);
      // El eco del servidor retira "b" de la mano viva…
      fixture.componentRef.setInput('hand', [makeCard('a')]);
      fixture.detectChanges();
      // …pero la foto de layout aún sostiene al ghost
      expect(fixture.nativeElement.querySelectorAll('.hand-card--ghost')).toHaveLength(1);
      expect(fixture.nativeElement.querySelectorAll('app-hand-card')).toHaveLength(1);

      // Termina la ventana de animación: la mano viva retoma el control
      jest.advanceTimersByTime(HandMotionService.LEAVE_MS);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.hand-card--ghost')).toHaveLength(0);
      expect(fixture.nativeElement.querySelectorAll('app-hand-card')).toHaveLength(1);
      jest.useRealTimers();
    });
  });

  describe('ghostBackground', () => {
    it('should usar el token de color de la carta', () => {
      expect(component.ghostBackground(makeCard('a', CardColor.Green))).toBe('var(--card-green)');
      expect(component.ghostBackground(makeCard('a', CardColor.Orange))).toBe('var(--card-orange)');
    });

    it('should usar el gradiente halloween para tratamientos halloween', () => {
      const card = makeCard('a', CardColor.Halloween, CardKind.Treatment);
      expect(component.ghostBackground(card)).toBe('var(--card-treatment-halloween)');

      // Un no-tratamiento halloween cae al token de color
      expect(component.ghostBackground(makeCard('b', CardColor.Halloween, CardKind.Virus))).toBe('var(--card-halloween)');
    });
  });

  describe('reparto escalonado', () => {
    it('should dar delay creciente a las cartas que entran a la vez', () => {
      fixture.componentRef.setInput('hand', [makeCard('a')]);
      fixture.detectChanges();
      expect(component.staggerDelay('a')).toBeNull();

      // Reparto: tres cartas nuevas a la vez
      fixture.componentRef.setInput('hand', [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d')]);
      fixture.detectChanges();

      expect(component.staggerDelay('b')).toBeNull(); // primera: 0 ms
      expect(component.staggerDelay('c')).toBe('70ms');
      expect(component.staggerDelay('d')).toBe('140ms');

      // Al cambiar la mano de nuevo, los delays viejos se limpian
      fixture.componentRef.setInput('hand', [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d'), makeCard('e')]);
      fixture.detectChanges();
      expect(component.staggerDelay('d')).toBeNull();
      expect(component.staggerDelay('e')).toBeNull();
    });

    it('should no escalar un robo individual (1 carta nueva)', () => {
      fixture.componentRef.setInput('hand', [makeCard('a')]);
      fixture.detectChanges();

      fixture.componentRef.setInput('hand', [makeCard('a'), makeCard('b')]);
      fixture.detectChanges();

      expect(component.staggerDelay('b')).toBeNull();
    });
  });
});

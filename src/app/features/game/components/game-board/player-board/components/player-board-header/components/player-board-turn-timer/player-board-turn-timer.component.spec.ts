import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerBoardTurnTimerComponent } from './player-board-turn-timer.component';

describe('PlayerBoardTurnTimerComponent', () => {
  let component: PlayerBoardTurnTimerComponent;
  let fixture: ComponentFixture<PlayerBoardTurnTimerComponent>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerBoardTurnTimerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerBoardTurnTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeElement = fixture.nativeElement as HTMLElement;
  });

  const setInput = <K extends keyof PlayerBoardTurnTimerComponent>(key: K, value: any) => {
    fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra los segundos sin icono de pausa por defecto', () => {
    setInput('remainingSeconds', 42);

    expect(nativeElement.textContent).toContain('42s');
    expect(nativeElement.querySelector('.turn-timer__pause-icon')).toBeNull();
    expect(nativeElement.querySelector('.turn-timer')?.classList.contains('turn-timer--paused')).toBe(false);
  });

  it('cuando está en pausa muestra el icono ⏸ y la clase turn-timer--paused', () => {
    setInput('remainingSeconds', 58);
    setInput('timerPaused', true);

    const span = nativeElement.querySelector('.turn-timer');
    expect(nativeElement.querySelector('.turn-timer__pause-icon')?.textContent).toBe('⏸');
    expect(span?.classList.contains('turn-timer--paused')).toBe(true);
    expect(nativeElement.textContent).toContain('58s');
  });

  it('cuando está en pausa no aplica las clases de warning/critical', () => {
    setInput('timerPaused', true);
    setInput('timerState', 'critical');

    const span = nativeElement.querySelector('.turn-timer');
    expect(span?.classList.contains('turn-timer--paused')).toBe(true);
    expect(span?.classList.contains('turn-timer--critical')).toBe(false);
    expect(span?.classList.contains('turn-timer--warning')).toBe(false);
  });
});

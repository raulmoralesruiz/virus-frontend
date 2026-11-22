import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmoteTrayComponent } from './emote-tray.component';
import { GameStoreService } from '@core/services/game-store.service';
import { EMOTES } from '@core/constants/emote.constants';

describe('EmoteTrayComponent', () => {
  let component: EmoteTrayComponent;
  let fixture: ComponentFixture<EmoteTrayComponent>;
  let gameStoreMock: { sendEmote: jest.Mock };

  beforeEach(async () => {
    gameStoreMock = { sendEmote: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [EmoteTrayComponent],
      providers: [{ provide: GameStoreService, useValue: gameStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EmoteTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render one button per whitelisted emote', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.emote-tray__btn');
    expect(buttons).toHaveLength(EMOTES.length);
    expect(buttons[0].textContent).toContain('👍');
  });

  it('should emit sendEmote(roomId, emote) on click', () => {
    fixture.componentRef.setInput('roomId', 'r1');
    const buttons = fixture.nativeElement.querySelectorAll('.emote-tray__btn');
    (buttons[1] as HTMLButtonElement).click(); // 🔥

    expect(gameStoreMock.sendEmote).toHaveBeenCalledWith('r1', '🔥');
  });

  it('should not send anything when roomId is missing', () => {
    fixture.componentRef.setInput('roomId', null);
    const buttons = fixture.nativeElement.querySelectorAll('.emote-tray__btn');
    (buttons[0] as HTMLButtonElement).click();

    expect(gameStoreMock.sendEmote).not.toHaveBeenCalled();
  });
});

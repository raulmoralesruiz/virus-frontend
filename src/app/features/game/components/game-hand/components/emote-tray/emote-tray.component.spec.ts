import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmoteTrayComponent } from './emote-tray.component';
import { GameStoreService } from '@core/services/game-store.service';
import { EMOTES } from '@core/constants/emote.constants';

describe('EmoteTrayComponent', () => {
  let component: EmoteTrayComponent;
  let fixture: ComponentFixture<EmoteTrayComponent>;
  let host: HTMLElement;
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
    host = fixture.nativeElement as HTMLElement;
  });

  const trigger = () => host.querySelector<HTMLButtonElement>('.emote-tray__trigger')!;
  const emoteButtons = () =>
    Array.from(host.querySelectorAll<HTMLButtonElement>('.emote-tray__btn'));
  const openTray = () => {
    trigger().click();
    fixture.detectChanges();
  };

  it('starts collapsed: no emote buttons in the tree', () => {
    expect(emoteButtons()).toHaveLength(0);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the panel with one button per whitelisted emote', () => {
    openTray();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    const buttons = emoteButtons();
    expect(buttons).toHaveLength(EMOTES.length);
    expect(buttons[0].textContent).toContain('👍');
  });

  it('closes the panel when the trigger is clicked again', () => {
    openTray();

    trigger().click();
    fixture.detectChanges();

    expect(emoteButtons()).toHaveLength(0);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('sends the emote, autocloses the panel and returns focus to the trigger', () => {
    fixture.componentRef.setInput('roomId', 'r1');
    openTray();
    const fire = emoteButtons()[1]; // 🔥
    fire.focus();
    fire.click();
    fixture.detectChanges();

    expect(gameStoreMock.sendEmote).toHaveBeenCalledTimes(1);
    expect(gameStoreMock.sendEmote).toHaveBeenCalledWith('r1', '🔥');
    expect(emoteButtons()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger());
  });

  it('does not send anything when roomId is missing, but still closes', () => {
    fixture.componentRef.setInput('roomId', null);
    openTray();

    emoteButtons()[0].click();
    fixture.detectChanges();

    expect(gameStoreMock.sendEmote).not.toHaveBeenCalled();
    expect(emoteButtons()).toHaveLength(0);
  });

  it('closes the panel with Escape and returns focus to the trigger', () => {
    fixture.componentRef.setInput('roomId', 'r1');
    openTray();
    const first = emoteButtons()[0];
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(emoteButtons()).toHaveLength(0);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('lets Escape bubble when collapsed (no interference with parent dialogs)', () => {
    const handler = jest.fn((event: Event) => event.stopPropagation());
    document.addEventListener('keydown', handler);
    try {
      trigger().focus();
      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    } finally {
      document.removeEventListener('keydown', handler);
    }

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('closes the panel on an outside click and does not steal focus', () => {
    openTray();
    const other = document.createElement('button');
    document.body.appendChild(other);
    try {
      other.focus();
      other.click();
      fixture.detectChanges();

      expect(emoteButtons()).toHaveLength(0);
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(other);
    } finally {
      other.remove();
    }
  });
});

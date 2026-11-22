import { TestBed } from '@angular/core/testing';
import { TimerSoundService } from './timer-sound.service';

describe('TimerSoundService', () => {
  let service: TimerSoundService;
  let mockAudioInstance: any;
  let OriginalAudio: any;

  beforeEach(() => {
    // Fiel a HTMLAudioElement: un elemento nunca reproducido está PAUSADO.
    mockAudioInstance = {
      play: jest.fn().mockImplementation(() => {
        mockAudioInstance.paused = false;
        return Promise.resolve();
      }),
      pause: jest.fn().mockImplementation(() => {
        mockAudioInstance.paused = true;
      }),
      load: jest.fn(),
      paused: true,
      currentTime: 0,
      volume: 1,
      loop: false,
    };

    OriginalAudio = global.Audio;
    global.Audio = jest.fn().mockImplementation(() => mockAudioInstance) as any;

    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerSoundService);
  });

  afterEach(() => {
    global.Audio = OriginalAudio;
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle mute', () => {
    expect(service.isMuted()).toBe(false);
    service.toggleMute();
    expect(service.isMuted()).toBe(true);
  });

  it('should play turn start if not muted', () => {
    service.playTurnStart();
    expect(mockAudioInstance.play).toHaveBeenCalled();
  });

  it('should NOT play turn start if muted', () => {
    service.toggleMute();
    service.playTurnStart();
    expect(mockAudioInstance.play).not.toHaveBeenCalled();
  });

  it('should play tick if not muted', () => {
    service.playTick('running');
    expect(mockAudioInstance.play).toHaveBeenCalled();
    expect(mockAudioInstance.currentTime).toBe(0);
  });

  it('should NOT play tick if muted', () => {
    service.toggleMute();
    service.playTick('warning');
    expect(mockAudioInstance.play).not.toHaveBeenCalled();
  });

  it('should play winner if not muted', () => {
    service.playWinner();
    expect(mockAudioInstance.play).toHaveBeenCalled();
  });

  it('should NOT play winner if muted', () => {
    service.toggleMute();
    service.playWinner();
    expect(mockAudioInstance.play).not.toHaveBeenCalled();
  });

  it('should handle play exception safely', () => {
    mockAudioInstance.play.mockReturnValue(Promise.reject(new Error('no audio allowed')));
    service.playWinner();
    // Rejection should be caught and ignored
  });

  it('should handle play returning undefined (old browsers)', () => {
    mockAudioInstance.play.mockReturnValue(undefined);
    service.playWinner();
    expect(mockAudioInstance.play).toHaveBeenCalled();
  });

  describe('mute persistence', () => {
    it('should default to unmuted when there is no stored value', () => {
      expect(service.isMuted()).toBe(false);
    });

    it('should restore muted state from localStorage on init', () => {
      localStorage.setItem('virus-muted', 'true');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const restored = TestBed.inject(TimerSoundService);
      expect(restored.isMuted()).toBe(true);
    });

    it('should persist mute state to localStorage on toggle', () => {
      service.toggleMute();
      expect(localStorage.getItem('virus-muted')).toBe('true');
      service.toggleMute();
      expect(localStorage.getItem('virus-muted')).toBe('false');
    });

    it('should ignore invalid stored values', () => {
      localStorage.setItem('virus-muted', 'not-a-boolean');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const restored = TestBed.inject(TimerSoundService);
      expect(restored.isMuted()).toBe(false);
    });

    it('should handle storage exceptions safely on toggle', () => {
      const realSetItem = Storage.prototype.setItem;
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(() => service.toggleMute()).not.toThrow();
      expect(service.isMuted()).toBe(true);
      jest.restoreAllMocks();
    });
  });

  describe('BGM (música en partida)', () => {
    it('should start music when not muted', () => {
      service.startMusic();
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it('should NOT start music when muted', () => {
      service.toggleMute();
      service.startMusic();
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should be idempotent: not restart the loop if already playing', () => {
      service.startMusic();
      mockAudioInstance.play.mockClear();
      service.startMusic();
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should stop music (pause the element)', () => {
      service.startMusic();
      expect(mockAudioInstance.paused).toBe(false); // sonando
      service.stopMusic();
      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(mockAudioInstance.paused).toBe(true);
    });

    it('should pause active BGM when muting', () => {
      service.startMusic();
      mockAudioInstance.play.mockClear();
      service.toggleMute();
      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should resume BGM when unmuting if music was active', () => {
      service.startMusic();
      service.toggleMute(); // mute → pausa
      expect(mockAudioInstance.paused).toBe(true);
      mockAudioInstance.play.mockClear();
      service.toggleMute(); // unmute → reanuda
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it('should NOT resume BGM when unmuting if music was never active', () => {
      service.toggleMute();
      service.toggleMute();
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it('should configure the BGM element with loop and a low volume', () => {
      expect(mockAudioInstance.loop).toBe(true);
      expect(mockAudioInstance.volume).toBeLessThan(0.5);
    });

    it('should handle BGM autoplay rejection safely', () => {
      mockAudioInstance.play.mockReturnValue(Promise.reject(new Error('autoplay blocked')));
      expect(() => service.startMusic()).not.toThrow();
    });

    it('stopMusic should be idempotent (safe to call from several exit paths)', () => {
      service.startMusic();
      service.stopMusic();
      service.stopMusic();
      service.stopMusic();
      expect(mockAudioInstance.pause).toHaveBeenCalledTimes(1);
      expect(service.isMusicActive()).toBe(false);
    });

    describe('invariante: la música solo suena durante la partida', () => {
      it('should NOT be active before startMusic', () => {
        expect(service.isMusicActive()).toBe(false);
      });

      it('should be active during the game (startMusic)', () => {
        service.startMusic();
        expect(service.isMusicActive()).toBe(true);
      });

      it('should NOT be active after leaving the game (stopMusic)', () => {
        service.startMusic();
        expect(service.isMusicActive()).toBe(true);
        service.stopMusic();
        expect(service.isMusicActive()).toBe(false);
        // y no se reanuda sola: solo un startMusic() explícito (nueva partida)
        expect(mockAudioInstance.play).toHaveBeenCalledTimes(1);
      });

      it('should NOT be active after stopMusic even if never started', () => {
        service.stopMusic();
        expect(service.isMusicActive()).toBe(false);
      });
    });
  });
});

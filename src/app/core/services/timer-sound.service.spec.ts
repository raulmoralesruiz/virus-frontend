import { TestBed } from '@angular/core/testing';
import { TimerSoundService } from './timer-sound.service';

describe('TimerSoundService', () => {
  let service: TimerSoundService;
  let mockAudioInstance: any;
  let OriginalAudio: any;

  beforeEach(() => {
    mockAudioInstance = {
      play: jest.fn().mockImplementation(() => Promise.resolve()),
      load: jest.fn(),
      currentTime: 0,
    };
    
    OriginalAudio = global.Audio;
    global.Audio = jest.fn().mockImplementation(() => mockAudioInstance) as any;

    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerSoundService);
  });

  afterEach(() => {
    global.Audio = OriginalAudio;
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
});

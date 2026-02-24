import { TestBed } from '@angular/core/testing';
import { GameFullscreenService } from './game-fullscreen.service';
import { DOCUMENT } from '@angular/common';

describe('GameFullscreenService', () => {
  let service: GameFullscreenService;
  let mockDocument: {
      fullscreenElement: Element | null,
      documentElement: { requestFullscreen: jest.Mock },
      exitFullscreen: jest.Mock,
      addEventListener: jest.Mock
  };

  beforeEach(() => {
    mockDocument = {
      fullscreenElement: null,
      documentElement: {
         requestFullscreen: jest.fn().mockResolvedValue(undefined)
      },
      exitFullscreen: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GameFullscreenService,
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });
  });

  it('should initialize signal to false when no fullscreenElement', () => {
      mockDocument.fullscreenElement = null;
      service = TestBed.inject(GameFullscreenService);
      expect(service.isFullscreenActive()).toBe(false);
  });

  it('should initialize signal to true when fullscreenElement exists', () => {
    mockDocument.fullscreenElement = {} as Element;
    service = TestBed.inject(GameFullscreenService);
    expect(service.isFullscreenActive()).toBe(true);
  });

  it('should attach fullscreenchange listener and update signal when triggered', () => {
    service = TestBed.inject(GameFullscreenService);
    
    expect(mockDocument.addEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
    
    const listener = mockDocument.addEventListener.mock.calls[0][1];
    
    expect(service.isFullscreenActive()).toBe(false);
    
    mockDocument.fullscreenElement = {} as Element;
    listener(); // emulate event
    
    expect(service.isFullscreenActive()).toBe(true);
  });

  describe('toggleFullscreen', () => {
    beforeEach(() => {
       service = TestBed.inject(GameFullscreenService);
    });

    it('should call exitFullscreen if already in fullscreen', async () => {
       mockDocument.fullscreenElement = {} as Element;
       await service.toggleFullscreen();
       expect(mockDocument.exitFullscreen).toHaveBeenCalled();
       expect(mockDocument.documentElement.requestFullscreen).not.toHaveBeenCalled();
    });

    it('should call requestFullscreen if not in fullscreen', async () => {
        mockDocument.fullscreenElement = null;
        await service.toggleFullscreen();
        expect(mockDocument.documentElement.requestFullscreen).toHaveBeenCalled();
        expect(mockDocument.exitFullscreen).not.toHaveBeenCalled();
    });

    it('should catch error and log it if promise rejects', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockDocument.fullscreenElement = null;
        mockDocument.documentElement.requestFullscreen.mockRejectedValue(new Error('Test error'));
        
        await service.toggleFullscreen();
        
        expect(consoleSpy).toHaveBeenCalledWith('Error toggling fullscreen', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('should update signal in finally block', async () => {
        mockDocument.fullscreenElement = null; // Start out
        
        // Let's pretend requestFullscreen causes document.fullscreenElement to be set synchronously (just for mock logic testing)
        mockDocument.documentElement.requestFullscreen.mockImplementation(async () => {
             mockDocument.fullscreenElement = {} as Element;
        });

        await service.toggleFullscreen();
        expect(service.isFullscreenActive()).toBe(true);
    });
    
    it('should do nothing gracefully if documentElement is null', async () => {
        mockDocument.fullscreenElement = null;
        (mockDocument as any).documentElement = null;
        
        await service.toggleFullscreen();
        
        expect(mockDocument.exitFullscreen).not.toHaveBeenCalled();
        expect(service.isFullscreenActive()).toBe(false);
    });
  });
});

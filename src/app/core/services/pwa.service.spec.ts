import { TestBed } from '@angular/core/testing';
import { PwaService } from './pwa.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ApplicationRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let swUpdateMock: any;
  let appRefMock: any;
  let documentMock: any;
  let isStableSubject: Subject<boolean>;
  let versionUpdatesSubject: Subject<any>;
  let addEventListenerSpy: jest.SpyInstance;
  let addEventListenerCalls: any[] = [];
  
  // Real document reference to restore later
  const originalLocation = document.location;

  beforeEach(() => {
    isStableSubject = new Subject<boolean>();
    versionUpdatesSubject = new Subject<any>();
    addEventListenerCalls = [];
    
    // Mock window event listeners to collect handlers
    addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      addEventListenerCalls.push({ event, handler });
    });

    swUpdateMock = {
      isEnabled: true,
      checkForUpdate: jest.fn(),
      activateUpdate: jest.fn().mockResolvedValue(true),
      versionUpdates: versionUpdatesSubject.asObservable()
    };

    appRefMock = {
      isStable: isStableSubject.asObservable()
    };

    documentMock = {
      location: { reload: jest.fn() }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: swUpdateMock },
        { provide: ApplicationRef, useValue: appRefMock },
        { provide: DOCUMENT, useValue: documentMock },
        PwaService
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    service = TestBed.inject(PwaService);
    expect(service).toBeTruthy();
  });

  describe('initUpdateChecks', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not initialize checks if swUpdate is disabled', () => {
      swUpdateMock.isEnabled = false;
      service = TestBed.inject(PwaService);
      isStableSubject.next(true);
      jest.advanceTimersByTime(100);
      expect(swUpdateMock.checkForUpdate).not.toHaveBeenCalled();
    });

    it('should check for update when app is stable', () => {
      service = TestBed.inject(PwaService);
      isStableSubject.next(true);
      expect(swUpdateMock.checkForUpdate).toHaveBeenCalled();
    });

    it('should check for update periodically', () => {
      service = TestBed.inject(PwaService);
      isStableSubject.next(true);
      expect(swUpdateMock.checkForUpdate).toHaveBeenCalledTimes(1);
      
      // Advance 15 minutes
      jest.advanceTimersByTime(15 * 60 * 1000);
      expect(swUpdateMock.checkForUpdate).toHaveBeenCalledTimes(2);
    });

    it('should set updateAvailable when VERSION_READY event occurs', () => {
      service = TestBed.inject(PwaService);
      versionUpdatesSubject.next({ type: 'VERSION_READY' } as VersionReadyEvent);
      expect(service.updateAvailable()).toBe(true);
    });
      
    it('should ignore other version update events', () => {
      service = TestBed.inject(PwaService);
      versionUpdatesSubject.next({ type: 'VERSION_DETECTED' });
      expect(service.updateAvailable()).toBe(false);
    });
  });

  describe('updateNow', () => {
    it('should call activateUpdate and reload document when enabled', async () => {
      service = TestBed.inject(PwaService);
      await service.updateNow();
      
      expect(swUpdateMock.activateUpdate).toHaveBeenCalled();
      
      // Allow activateUpdate promise chain to complete
      await Promise.resolve();
      await Promise.resolve(); // extra microtask just in case
      
      expect(documentMock.location.reload).toHaveBeenCalled();
    });

    it('should not call activateUpdate when disabled', () => {
      swUpdateMock.isEnabled = false;
      service = TestBed.inject(PwaService);
      service.updateNow();
      expect(swUpdateMock.activateUpdate).not.toHaveBeenCalled();
    });
  });

  describe('installPrompt', () => {
    it('should handle beforeinstallprompt event globally', () => {
      service = TestBed.inject(PwaService);
      const beforeInstallPromptCall = addEventListenerCalls.find(call => call.event === 'beforeinstallprompt');
      expect(beforeInstallPromptCall).toBeTruthy();
      
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      beforeInstallPromptCall.handler(mockEvent as any);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(service.isInstallable()).toBe(true);
    });
      
    it('should handle appinstalled event globally', () => {
      service = TestBed.inject(PwaService);
      
      // Setup deferred prompt first
      const beforeInstallPromptCall = addEventListenerCalls.find(call => call.event === 'beforeinstallprompt');
      const mockEvent = { preventDefault: jest.fn() };
      beforeInstallPromptCall.handler(mockEvent as any);
      expect(service.isInstallable()).toBe(true);

      // Now trigger installed
      const appInstalledCall = addEventListenerCalls.find(call => call.event === 'appinstalled');
      expect(appInstalledCall).toBeTruthy();
      appInstalledCall.handler(new Event('appinstalled'));
      
      expect(service.isInstallable()).toBe(false);
    });

    it('promptInstall should just return if deferredPrompt is null', async () => {
      service = TestBed.inject(PwaService);
      await service.promptInstall(); // Nothing happens, deferred prompt is null
    });
      
    it('promptInstall should show prompt and handle user accepted choice', async () => {
       service = TestBed.inject(PwaService);
       const beforeInstallPromptCall = addEventListenerCalls.find(call => call.event === 'beforeinstallprompt');
       
       const mockEvent = {
         preventDefault: jest.fn(),
         prompt: jest.fn(),
         userChoice: Promise.resolve({ outcome: 'accepted' })
       };
       
       beforeInstallPromptCall.handler(mockEvent as any);
       
       await service.promptInstall();
       
       expect(mockEvent.prompt).toHaveBeenCalled();
       expect(service.isInstallable()).toBe(false); // Accepted handles removal of the prompt internal state
    });
      
    it('promptInstall should show prompt and handle user dismissed choice', async () => {
       service = TestBed.inject(PwaService);
       const beforeInstallPromptCall = addEventListenerCalls.find(call => call.event === 'beforeinstallprompt');
       
       const mockEvent = {
         preventDefault: jest.fn(),
         prompt: jest.fn(),
         userChoice: Promise.resolve({ outcome: 'dismissed' })
       };
       
       beforeInstallPromptCall.handler(mockEvent as any);
       service.isInstallable.set(true);
       
       await service.promptInstall();
       
       expect(mockEvent.prompt).toHaveBeenCalled();
       expect(service.isInstallable()).toBe(true); // Should remain installable true if not accepted
    });
  });
});

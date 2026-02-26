import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { DOCUMENT } from '@angular/common';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockDocument: any;
  let mockStorage: any;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    mockDocument = {
      documentElement: {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        }
      },
      defaultView: {
        localStorage: mockStorage
      }
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });
  });

  describe('initialization', () => {
    it('should set default theme to dark', () => {
        service = TestBed.inject(ThemeService);
        expect(service.theme()).toBe('dark');
        expect(service.isDark()).toBe(true);
    });

    it('should load stored theme if available', () => {
        mockStorage.getItem.mockReturnValue('light');
        service = TestBed.inject(ThemeService);
        expect(service.theme()).toBe('light');
    });

    it('should handle storage unavailable on init safely', () => {
        mockDocument.defaultView = null;
        service = TestBed.inject(ThemeService);
        expect(service.theme()).toBe('dark');
    });

    it('should handle invalid stored theme', () => {
        mockStorage.getItem.mockReturnValue('invalid-theme');
        service = TestBed.inject(ThemeService);
        expect(service.theme()).toBe('dark');
    });
  });

  describe('methods', () => {
    beforeEach(() => {
        service = TestBed.inject(ThemeService);
    });

    it('should toggle theme', () => {
        expect(service.theme()).toBe('dark');
        service.toggleTheme();
        expect(service.theme()).toBe('light');
        service.toggleTheme();
        expect(service.theme()).toBe('dark');
    });

    it('should not do anything if setting same theme', () => {
        service.setTheme('dark');
        // effect runs initially anyway so just verifying it doesn't crash
        expect(service.theme()).toBe('dark');
    });

    it('should handle missing documentElement when applying theme', () => {
        mockDocument.documentElement = null;
        service.setTheme('light');
        TestBed.flushEffects();
        expect(service.theme()).toBe('light');
        // Should not throw
    });

    it('should handle missing storage when storing theme', () => {
        mockDocument.defaultView = null;
        service.setTheme('light');
        TestBed.flushEffects();
        // Should not throw and catch block covered
    });

    it('should handle storage setItem exception', () => {
        mockStorage.setItem.mockImplementation(() => { throw new Error('Quota exceeded'); });
        service.setTheme('light');
        TestBed.flushEffects();
        // should capture exception and swallow
    });

    it('should handle window exception during getStorage', () => {
       Object.defineProperty(mockDocument, 'defaultView', {
           get: () => { throw new Error('SecurityError') }
       });
       
       service.setTheme('light');
       TestBed.flushEffects();
       expect(service.theme()).toBe('light'); // does not crash
    });
  });
});

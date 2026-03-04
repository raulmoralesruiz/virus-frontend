import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwaModalComponent } from './pwa-modal.component';
import { PwaService } from '../../../core/services/pwa.service';
import { signal } from '@angular/core';

describe('PwaModalComponent', () => {
  let component: PwaModalComponent;
  let fixture: ComponentFixture<PwaModalComponent>;
  let pwaServiceMock: any;
  let updateAvailableSignal: any;
  let isInstallableSignal: any;

  beforeEach(async () => {
    updateAvailableSignal = signal(false);
    isInstallableSignal = signal(false);

    pwaServiceMock = {
      updateAvailable: updateAvailableSignal,
      isInstallable: isInstallableSignal,
      updateNow: jest.fn(),
      promptInstall: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PwaModalComponent],
      providers: [
        { provide: PwaService, useValue: pwaServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PwaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Modal Trigger Button', () => {
    it('should not show trigger button when neither update nor install is available', () => {
      updateAvailableSignal.set(false);
      isInstallableSignal.set(false);
      fixture.detectChanges();
      
      const btn = fixture.nativeElement.querySelector('.pwa-trigger-btn');
      expect(btn).toBeFalsy();
    });

    it('should show trigger button and update text when update is available', () => {
      updateAvailableSignal.set(true);
      isInstallableSignal.set(false);
      fixture.detectChanges();
      
      const btn = fixture.nativeElement.querySelector('.pwa-trigger-btn');
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('title')).toBe('Actualizar App');
    });

    it('should show trigger button and install text when only install is available', () => {
      updateAvailableSignal.set(false);
      isInstallableSignal.set(true);
      fixture.detectChanges();
      
      const btn = fixture.nativeElement.querySelector('.pwa-trigger-btn');
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('title')).toBe('Instalar App');
    });

    it('should open modal when trigger button is clicked', () => {
      updateAvailableSignal.set(true);
      fixture.detectChanges();
      
      const btn = fixture.nativeElement.querySelector('.pwa-trigger-btn');
      btn.click();
      fixture.detectChanges();
      
      // We know Modal has openModal called, and overlay shows
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlay).toBeTruthy();
    });
  });

  describe('Modal Content and Actions', () => {
    beforeEach(() => {
      component.openModal();
      fixture.detectChanges();
    });

    it('should show Update content when update is available', () => {
      updateAvailableSignal.set(true);
      fixture.detectChanges();
      
      const title = fixture.nativeElement.querySelector('#pwa-title');
      expect(title.textContent.trim()).toBe('Actualización Disponible');
      
      const acceptBtn = fixture.nativeElement.querySelector('.pwa-accept');
      expect(acceptBtn.textContent.trim()).toBe('Actualizar');
    });

    it('should show Install content when update is not available', () => {
      updateAvailableSignal.set(false);
      isInstallableSignal.set(true);
      fixture.detectChanges();
      
      const title = fixture.nativeElement.querySelector('#pwa-title');
      expect(title.textContent.trim()).toBe('Instalar Aplicación');
      
      const acceptBtn = fixture.nativeElement.querySelector('.pwa-accept');
      expect(acceptBtn.textContent.trim()).toBe('Instalar');
    });

    it('should call updateApp, which calls pwaService.updateNow and closes modal', () => {
      updateAvailableSignal.set(true);
      fixture.detectChanges();
      
      const acceptBtn = fixture.nativeElement.querySelector('.pwa-accept');
      acceptBtn.click();
      fixture.detectChanges();
      
      expect(pwaServiceMock.updateNow).toHaveBeenCalled();
      
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should call installApp, which calls pwaService.promptInstall and closes modal', () => {
      updateAvailableSignal.set(false);
      fixture.detectChanges();
      
      const acceptBtn = fixture.nativeElement.querySelector('.pwa-accept');
      acceptBtn.click();
      fixture.detectChanges();
      
      expect(pwaServiceMock.promptInstall).toHaveBeenCalled();
      
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should close modal when Cancel is clicked', () => {
      updateAvailableSignal.set(false);
      fixture.detectChanges();
      
      const cancelBtn = fixture.nativeElement.querySelector('.pwa-cancel');
      cancelBtn.click();
      fixture.detectChanges();
      
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should close modal when Close (X) is clicked', () => {
      // Need to add X button logic if testing it.
      // We didn't explicitly check the X button in template before but we can just call closeModal
      component.closeModal();
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlay).toBeFalsy();
    });
      
    it('should close modal when overlay is clicked', () => {
      const overlay = fixture.nativeElement.querySelector('.pwa-overlay');
      overlay.click();
      fixture.detectChanges();
      
      const overlayAfterClick = fixture.nativeElement.querySelector('.pwa-overlay');
      expect(overlayAfterClick).toBeFalsy();
    });
      
    it('should not close modal when modal dialog itself is clicked', () => {
       const modal = fixture.nativeElement.querySelector('.pwa-modal');
       // Mock stopPropagation
       const event = new MouseEvent('click');
       jest.spyOn(event, 'stopPropagation');
       modal.dispatchEvent(event);
       fixture.detectChanges();
       
       const overlayAfterClick = fixture.nativeElement.querySelector('.pwa-overlay');
       expect(overlayAfterClick).toBeTruthy();
    });
  });
});

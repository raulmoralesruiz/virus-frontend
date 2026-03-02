import { Injectable, signal, inject, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);

  // Signals for UI to react
  public updateAvailable = signal<boolean>(false);
  public isInstallable = signal<boolean>(false);

  // The native install prompt event
  private deferredPrompt: any = null;

  constructor() {
    this.initUpdateChecks();
    this.initInstallPrompt();
  }

  private initUpdateChecks() {
    if (!this.swUpdate.isEnabled) return;

    // Check for updates when the app stabilizes or every 15 minutes
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const everyPeriod$ = interval(15 * 60 * 1000);
    const everyPeriodOnceAppIsStable$ = concat(appIsStable$, everyPeriod$);

    everyPeriodOnceAppIsStable$.subscribe(() => this.swUpdate.checkForUpdate());

    // Listen to update events
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });
  }

  private initInstallPrompt() {
    // Listen for the beforeinstallprompt event globally
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      this.isInstallable.set(true);
    });

    // Optionally handle successful install
    window.addEventListener('appinstalled', () => {
      this.isInstallable.set(false);
      this.deferredPrompt = null;
    });
  }

  public updateNow() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
    }
  }

  public async promptInstall() {
    if (!this.deferredPrompt) {
      return;
    }
    // Show the install prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
    
    if (outcome === 'accepted') {
      this.isInstallable.set(false);
    }
  }
}

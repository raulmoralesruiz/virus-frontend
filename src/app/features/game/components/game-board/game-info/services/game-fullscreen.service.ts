import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GameFullscreenService {
  private readonly documentRef = inject(DOCUMENT);
  readonly isFullscreenActive = signal<boolean>(
    Boolean(this.documentRef.fullscreenElement)
  );

  constructor() {
    this.documentRef.addEventListener('fullscreenchange', () => {
      this.isFullscreenActive.set(Boolean(this.documentRef.fullscreenElement));
    });
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (this.documentRef.fullscreenElement) {
        await this.documentRef.exitFullscreen();
      } else {
        const element = this.documentRef.documentElement;
        if (element) {
          await element.requestFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen', error);
    } finally {
      this.isFullscreenActive.set(Boolean(this.documentRef.fullscreenElement));
    }
  }
}

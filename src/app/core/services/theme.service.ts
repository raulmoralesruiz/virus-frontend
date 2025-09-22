import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeSignal = signal<ThemeMode>('light');

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    effect(() => {
      this.applyTheme(this.themeSignal());
    });
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    if (this.themeSignal() === theme) {
      return;
    }

    this.themeSignal.set(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const body = this.document?.body;
    if (!body) {
      return;
    }

    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }
}

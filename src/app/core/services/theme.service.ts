import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'virus-theme-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeSignal = signal<ThemeMode>('light');

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    const storedTheme = this.readStoredTheme();
    if (storedTheme) {
      this.themeSignal.set(storedTheme);
    }

    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
      this.storeTheme(theme);
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

  private readStoredTheme(): ThemeMode | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    const storedTheme = storage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
  }

  private storeTheme(theme: ThemeMode): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Swallow storage exceptions (private mode, quota issues, etc.)
    }
  }

  private getStorage(): Storage | null {
    try {
      return this.document?.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}

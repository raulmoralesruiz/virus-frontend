import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { PwaService } from './core/services/pwa.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { PwaBannerComponent } from './core/components/pwa-banner/pwa-banner.component';
import { SvgSpriteComponent } from './core/components/svg-sprite/svg-sprite.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent, PwaBannerComponent, SvgSpriteComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  private readonly themeService = inject(ThemeService);
  protected readonly pwaService = inject(PwaService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly shouldShowThemeToggle = computed(
    () => !this.currentUrl().startsWith('/game'),
  );

  protected readonly shouldShowPwaBanner = computed(() => {
    const url = this.currentUrl();
    // Allow root / home
    if (url === '/home') return true;
    // Allow room-list
    if (url.startsWith('/room-list')) return true;
    // Allow room/:id (but not game which has a very different route)
    if (url.startsWith('/room/')) return true;
    
    return false;
  });
}

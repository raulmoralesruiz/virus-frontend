import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { SvgSpriteComponent } from './core/components/svg-sprite/svg-sprite.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent, SvgSpriteComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  private readonly themeService = inject(ThemeService);
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
}

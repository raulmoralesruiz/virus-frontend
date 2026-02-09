import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  readonly isDark = this.themeService.isDark;

  toggle(): void {
    this.themeService.toggleTheme();
  }
}

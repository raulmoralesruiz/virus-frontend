import { Component, input, output } from '@angular/core';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';

@Component({
  selector: 'game-info-controls',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './game-info-controls.html',
  styleUrl: './game-info-controls.css',
})
export class GameInfoControlsComponent {
  isMuted = input(false);
  isDarkTheme = input(false);
  isFullscreenActive = input(false);

  leaveRequested = output<void>();
  muteToggled = output<void>();
  themeToggled = output<void>();
  fullscreenToggled = output<void>();

  onLeaveClick(event: MouseEvent): void {
    event.stopPropagation();
    this.leaveRequested.emit();
  }

  onMuteToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.muteToggled.emit();
  }

  onThemeToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.themeToggled.emit();
  }

  onFullscreenToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.fullscreenToggled.emit();
  }
}

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-info-controls',
  standalone: true,
  templateUrl: './game-info-controls.html',
  styleUrl: './game-info-controls.css',
})
export class GameInfoControlsComponent {
  isMuted = input(false);
  isDarkTheme = input(false);
  isFullscreenActive = input(false);

  leaveRequested = output<void>();
  themeToggled = output<void>();
  fullscreenToggled = output<void>();
  muteToggled = output<void>();

  onLeaveClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.leaveRequested.emit();
  }

  onThemeToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.themeToggled.emit();
  }

  onFullscreenToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.fullscreenToggled.emit();
  }

  onMuteToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.muteToggled.emit();
  }
}

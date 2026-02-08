import { Component, input, output } from '@angular/core';
import { GameInfoLeaveButtonComponent } from './leave-button/game-info-leave-button';

@Component({
  selector: 'game-info-controls',
  standalone: true,
  imports: [GameInfoLeaveButtonComponent],
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

  onLeaveClick(): void {
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

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'game-info-controls',
  standalone: true,
  templateUrl: './game-info-controls.html',
  styleUrl: './game-info-controls.css',
})
export class GameInfoControlsComponent {
  @Input() isMuted!: () => boolean;
  @Input() isDarkTheme!: () => boolean;
  @Input() isFullscreenActive = false;

  @Output() leaveRequested = new EventEmitter<void>();
  @Output() themeToggled = new EventEmitter<void>();
  @Output() fullscreenToggled = new EventEmitter<void>();
  @Output() muteToggled = new EventEmitter<void>();

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

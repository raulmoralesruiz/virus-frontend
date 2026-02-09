import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PublicGameState } from '@core/models/game.model';
import { GameInfoPileComponent } from './pile/game-info-pile';
import { GameInfoControlsComponent } from './controls/game-info-controls';

@Component({
  selector: 'game-info-details',
  standalone: true,
  imports: [DatePipe, GameInfoPileComponent, GameInfoControlsComponent],
  templateUrl: './game-info-details.html',
  styleUrl: './game-info-details.css',
})
export class GameInfoDetailsComponent {
  state = input.required<PublicGameState>();
  gameDuration = input('');
  isMuted = input(false);
  isDarkTheme = input(false);
  isFullscreenActive = input(false);

  leaveRequested = output<void>();
  muteToggled = output<void>();
  themeToggled = output<void>();
  fullscreenToggled = output<void>();

  onLeaveRequested(): void {
    this.leaveRequested.emit();
  }

  onMuteToggled(): void {
    this.muteToggled.emit();
  }

  onThemeToggled(): void {
    this.themeToggled.emit();
  }

  onFullscreenToggled(): void {
    this.fullscreenToggled.emit();
  }
}

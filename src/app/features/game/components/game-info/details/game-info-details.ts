import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PublicGameState } from '../../../../../core/models/game.model';
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
  @Input() state!: PublicGameState;
  @Input() gameDuration = '';
  @Input() isMuted!: () => boolean;
  @Input() isDarkTheme!: () => boolean;
  @Input() isFullscreenActive = false;

  @Output() leaveRequested = new EventEmitter<void>();
  @Output() muteToggled = new EventEmitter<void>();
  @Output() themeToggled = new EventEmitter<void>();
  @Output() fullscreenToggled = new EventEmitter<void>();

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

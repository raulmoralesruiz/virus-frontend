import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { DatePipe } from '@angular/common';
import { TimerSoundService } from '../../../../core/services/timer-sound.service';

@Component({
  selector: 'game-info',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './game-info.html',
  styleUrl: './game-info.css',
})
export class GameInfoComponent {
  @Input() state!: PublicGameState;
  @Input() historyCount = 0;
  @Output() historyRequested = new EventEmitter<void>();
  @Output() leaveRequested = new EventEmitter<void>();

  showDetails = false;
  private readonly timerSoundService = inject(TimerSoundService);
  readonly isMuted = this.timerSoundService.isMuted;

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }

  onLeaveClick(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.leaveRequested.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDetails();
    }
  }

  onToggleMute(event: MouseEvent): void {
    event.stopPropagation();
    this.timerSoundService.toggleMute();
  }

  get shortRoomId(): string {
    return this.state?.roomId?.substring(0, 6) ?? '';
  }
}

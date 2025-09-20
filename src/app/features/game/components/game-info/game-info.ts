import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PublicGameState } from '../../../../core/models/game.model';
import { DatePipe } from '@angular/common';

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

  showDetails = false;

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onHistoryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.historyRequested.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDetails();
    }
  }

  get shortRoomId(): string {
    return this.state?.roomId?.substring(0, 6) ?? '';
  }
}

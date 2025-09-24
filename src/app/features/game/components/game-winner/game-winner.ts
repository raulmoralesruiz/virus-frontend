import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { PublicPlayerInfo } from '../../../../core/models/game.model';
import { TimerSoundService } from '../../../../core/services/timer-sound.service';

@Component({
  selector: 'game-winner',
  standalone: true,
  imports: [],
  templateUrl: './game-winner.html',
  styleUrl: './game-winner.css',
})
export class GameWinnerComponent implements OnChanges {
  private readonly timerSoundService = inject(TimerSoundService);

  @Input() winner!: { player: PublicPlayerInfo['player'] };
  @Output() reset = new EventEmitter<void>();

  isVisible = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['winner']?.currentValue) {
      this.isVisible = true;
      this.timerSoundService.playWinner();
    }
  }

  onReset() {
    this.reset.emit();
  }

  closeModal() {
    this.isVisible = false;
  }
}


import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { RoomStoreService } from '@core/services/room-store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room-enter',
  standalone: true,
  imports: [],
  templateUrl: './room-enter.component.html',
  styleUrl: './room-enter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomEnterComponent implements OnDestroy {
  private apiPlayer = inject(ApiPlayerService);
  private roomStore = inject(RoomStoreService);

  roomId = input.required<string>();

  isCreatingPlayer = signal(false);
  creationError = signal<string | null>(null);
  private createPlayerSub: Subscription | null = null;

  ngOnDestroy(): void {
    if (this.createPlayerSub) {
      this.createPlayerSub.unsubscribe();
      this.createPlayerSub = null;
    }
  }

  createPlayerAndJoin(input: HTMLInputElement) {
    if (this.isCreatingPlayer()) return;

    const name = input.value.trim();
    if (!name) {
      this.creationError.set('Introduce tu nombre para continuar.');
      return;
    }

    this.creationError.set(null);
    this.isCreatingPlayer.set(true);
    if (this.createPlayerSub) {
      this.createPlayerSub.unsubscribe();
    }

    this.createPlayerSub = this.apiPlayer.createPlayer(name).subscribe({
      next: (player) => {
        this.isCreatingPlayer.set(false);
        this.roomStore.joinRoom(this.roomId(), player);
      },
      error: () => {
        this.isCreatingPlayer.set(false);
        this.creationError.set(
          'No pudimos crear tu jugador. Inténtalo de nuevo en unos segundos.'
        );
      },
    });
  }
}

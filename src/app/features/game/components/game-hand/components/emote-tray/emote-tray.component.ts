import { Component, inject, input } from '@angular/core';
import { EMOTES } from '@core/constants/emote.constants';
import { GameStoreService } from '@core/services/game-store.service';

@Component({
  selector: 'game-emote-tray',
  standalone: true,
  templateUrl: './emote-tray.component.html',
  styleUrl: './emote-tray.component.css',
})
export class EmoteTrayComponent {
  readonly emotes = EMOTES;
  roomId = input<string | null>(null);

  private readonly gameStore = inject(GameStoreService);

  send(emote: string) {
    const roomId = this.roomId();
    if (!roomId) return;
    this.gameStore.sendEmote(roomId, emote);
  }
}

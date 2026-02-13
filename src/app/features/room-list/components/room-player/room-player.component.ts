import { Component, inject, signal } from '@angular/core';
import { ApiPlayerService } from '@core/services/api/api.player.service';
import { TitleCasePipe } from '@angular/common';
import { CardIconComponent } from '@app/shared/components/card-icon/card-icon.component';

@Component({
  selector: 'app-room-player',
  standalone: true,
  imports: [TitleCasePipe, CardIconComponent],
  templateUrl: './room-player.component.html',
  styleUrls: ['./room-player.component.css']
})
export class RoomPlayerComponent {
  private apiPlayerService = inject(ApiPlayerService);
  player = this.apiPlayerService.player;

  isEditingName = false;
  newName = '';

  toggleEditName() {
    this.isEditingName = !this.isEditingName;
    if (this.isEditingName) {
      this.newName = this.player()?.name || '';
    }
  }

  saveName() {
    if (!this.newName.trim()) return;

    const player = this.player();
    if (player) {
      this.apiPlayerService.updatePlayerName(player.id, this.newName).subscribe(() => {
        this.isEditingName = false;
      });
    }
  }

  cancelEditName() {
    this.isEditingName = false;
  }
}

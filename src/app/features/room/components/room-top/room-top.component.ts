import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Room } from '../../../../core/models/room.model';
import { RoomLabelComponent } from './components/room-label/room-label.component';
import { RoomActionsComponent } from './components/room-actions/room-actions.component';
import { RoomActionBtnComponent } from './components/room-action-btn/room-action-btn.component';
import { CardIconComponent } from '../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'app-room-top',
  standalone: true,
  imports: [RoomLabelComponent, RoomActionsComponent, RoomActionBtnComponent, CardIconComponent],
  templateUrl: './room-top.component.html',
  styleUrl: './room-top.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTopComponent {
  room = input.required<Room | null>();
  shareMessage = signal<string | null>(null);
  leaveRoom = output<void>();
  private shareMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  copyRoomCode() {
    const currentRoom = this.room();
    const code = currentRoom?.name ?? currentRoom?.id?.slice(0, 6) ?? '';
    if (!code) return;
    this.copyToClipboard(code, 'ID de sala copiado');
  }

  copyRoomLink() {
    const currentRoom = this.room();
    if (!currentRoom) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin) return;
    const link = `${origin}/room/${currentRoom.id}`;
    this.copyToClipboard(link, 'Enlace copiado');
  }

  private copyToClipboard(value: string, message: string) {
    if (!value) return;
    
    // Check if Clipboard API is supported and available
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value)
        .then(() => this.setShareMessage(message))
        .catch(err => {
          console.error('Failed to copy via Clipboard API:', err);
          this.setShareMessage('Error al copiar');
        });
    } else {
      console.warn('Clipboard API not available');
      this.setShareMessage('Copiado no soportado');
    }
  }

  private setShareMessage(message: string) {
    this.shareMessage.set(message);
    if (this.shareMessageTimeout) {
      clearTimeout(this.shareMessageTimeout);
    }
    this.shareMessageTimeout = setTimeout(() => {
      this.shareMessage.set(null);
      this.shareMessageTimeout = null;
    }, 2500);
  }
}

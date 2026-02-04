import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Signal,
  signal,
} from '@angular/core';
import { Room } from '../../../../core/models/room.model';

@Component({
  selector: 'app-room-top',
  standalone: true,
  imports: [],
  templateUrl: './room-top.component.html',
  styleUrl: './room-top.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTopComponent {
  room = input.required<Signal<Room | null>>();
  shareMessage = signal<string | null>(null);
  leaveRoom = output<void>();
  private shareMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  copyRoomCode() {
    const currentRoom = this.room()();
    const code = currentRoom?.name ?? currentRoom?.id?.slice(0, 6) ?? '';
    if (!code) return;
    this.copyToClipboard(code, 'ID de sala copiado');
  }

  copyRoomLink() {
    const currentRoom = this.room()();
    if (!currentRoom) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin) return;
    const link = `${origin}/room/${currentRoom.id}`;
    this.copyToClipboard(link, 'Enlace copiado');
  }

  private copyToClipboard(value: string, message: string) {
    if (!value) return;
    const navigatorClipboard =
      typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (navigatorClipboard && navigatorClipboard.writeText) {
      navigatorClipboard
        .writeText(value)
        .then(() => this.setShareMessage(message))
        .catch(() => this.fallbackCopy(value, message));
    } else {
      this.fallbackCopy(value, message);
    }
  }

  private fallbackCopy(value: string, message: string) {
    if (typeof document === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed'; // Avoid scrolling to bottom
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      this.setShareMessage(message);
    } catch (error) {
      console.warn('No se pudo copiar al portapapeles', error);
    } finally {
      document.body.removeChild(textarea);
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

import { Component, computed, inject, input } from '@angular/core';
import { RoomStoreService } from '@core/services/room-store.service';
import { Room } from '@core/models/room.model';

@Component({
  selector: 'app-room-timer',
  standalone: true,
  templateUrl: './room-timer.component.html',
  styleUrls: ['./room-timer.component.css']
})
export class RoomTimerComponent {
  room = input.required<Room | null>();
  private roomStore = inject(RoomStoreService);
  defaultTimerSeconds = 10 * 60;

  timeLeft = computed(() => {
    const remaining = this.roomStore.roomTimerSeconds() ?? this.defaultTimerSeconds;
    
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    return { minutes: m, seconds: s };
  });
}

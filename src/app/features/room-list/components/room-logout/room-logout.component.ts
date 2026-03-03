import { Component, input, signal } from '@angular/core';
import { CardIconComponent } from '@app/shared/components/card-icon/card-icon.component';

import { RoomExitComponent } from '@app/features/room/components/room-exit/room-exit.component';

@Component({
  selector: 'app-room-logout',
  standalone: true,
  imports: [CardIconComponent, RoomExitComponent],
  templateUrl: './room-logout.component.html',
  styleUrls: ['./room-logout.component.css']
})
export class RoomLogoutComponent {
  iconOnly = input(false);
  showConfirmModal = signal(false);

  logout() {
    this.showConfirmModal.set(true);
  }

  confirmLogout() {
    localStorage.clear();
    this.redirect();
  }

  cancelLogout() {
    this.showConfirmModal.set(false);
  }

  redirect() {
    window.location.href = '/home';
  }
}

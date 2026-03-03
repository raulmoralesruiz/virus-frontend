import { Component, input } from '@angular/core';
import { CardIconComponent } from '@app/shared/components/card-icon/card-icon.component';

@Component({
  selector: 'app-room-logout',
  standalone: true,
  imports: [CardIconComponent],
  templateUrl: './room-logout.component.html',
  styleUrls: ['./room-logout.component.css']
})
export class RoomLogoutComponent {
  iconOnly = input(false);

  logout() {
    localStorage.clear();
    this.redirect();
  }

  redirect() {
    window.location.href = '/home';
  }
}

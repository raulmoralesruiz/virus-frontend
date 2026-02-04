import { Component, inject } from '@angular/core';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { ThemeToggleComponent } from '../../../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'game-empty',
  standalone: true,
  imports: [ThemeToggleComponent],
  templateUrl: './game-empty.component.html',
  styleUrls: ['./game-empty.component.css']
})
export class GameEmptyComponent {
  private gameStore = inject(GameStoreService);

  goHome() {
    this.gameStore.goHome();
  }
}

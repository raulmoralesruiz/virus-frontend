import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { Player } from '../../core/models/player.model';
import { TestDndComponent } from '../game/components/prueba/test-dnd.component';
// import { TestDndComponent2 } from '../game/components/prueba/test-dnd2.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [],
})
export class HomeComponent implements OnInit {
  private apiPlayerService = inject(ApiPlayerService);
  private router = inject(Router);

  ngOnInit() {
    const player = this.apiPlayerService.player();
    if (player) {
      this.redirectRoomList(player);
    }
  }

  setName(name: string) {
    if (!name) return;

    this.apiPlayerService.createPlayer(name).subscribe({
      next: () => {
        this.router.navigate(['/room-list']);
      },
      error: (err) => {
        console.error('Error al crear jugador', err);
      },
    });
  }

  redirectRoomList(player: Player) {
    this.apiPlayerService.getPlayer(player.id).subscribe({
      next: () => this.router.navigate(['/room-list']),
      error: () => localStorage.removeItem('player'),
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiPlayerService } from '../../core/services/api/api.player.service';
import { Player } from '../../core/models/player.model';

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
  greeting = '¡Hola!';
  welcomeMessage = 'Bienvenido al juego más contagioso.';
  tagline =
    'Prepárate para contagiar la diversión, desafía a tus amigos y protege tus órganos.';

  ngOnInit() {
    this.greeting = this.buildGreeting();
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

  private buildGreeting(): string {
    const hour = new Date().getHours();
    let greeting = '¡Hola';

    if (hour >= 5 && hour < 12) {
      greeting = '¡Buenos días';
    } else if (hour < 18) {
      greeting = '¡Buenas tardes';
    } else {
      greeting = '¡Buenas noches';
    }

    return `${greeting}!`;
  }
}

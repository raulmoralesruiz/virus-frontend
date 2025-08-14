import { inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { SocketService } from './socket.service';
import { PLAYER_CONSTANTS } from '../../constants/player.constants';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class SocketPlayerService {
  private http = inject(HttpClient);
  player = signal<Player | null>(null);

  // crear jugador desde API, sin socket
  createPlayer(name: string): Observable<Player> {
    // Lógica para crear un jugador a través de la API
    const url = `${baseUrl}/api/player`;
    const body = { name: name.trim() };

    return this.http.post<Player>(url, body).pipe(
      tap((p) => {
        console.log('player', p);
      })
    );

    // this.http.post<Player>(url, body).subscribe({
    //   next: (player) => {
    //     this.player.set(player);
    //     localStorage.setItem('player', JSON.stringify(player));
    //   },
    //   error: (error) => {
    //     console.error('Error creating player:', error);
    //   },
    // });

    // const newPlayer: Player = {
    //   id: this.generatePlayerId(),
    //   name: name.trim(),
  }

  // constructor(private socketService: SocketService) {}

  // createPlayer(name: string) {
  //   this.socketService.emit(PLAYER_CONSTANTS.PLAYER_NEW, name);

  //   this.socketService.on(PLAYER_CONSTANTS.PLAYER_CREATED, (player: Player) => {
  //     this.player.set(player);
  //     localStorage.setItem('player', JSON.stringify(player));
  //   });
  // }

  // loadPlayerFromStorage() {
  //   const stored = localStorage.getItem('player');
  //   if (stored) {
  //     this.player.set(JSON.parse(stored));
  //   }
  // }
}

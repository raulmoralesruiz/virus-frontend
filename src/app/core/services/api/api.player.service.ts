import { inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiPlayerService {
  private http = inject(HttpClient);
  private urlPlayer = environment.baseUrl + '/player';

  private _player = signal<Player | null>(null);
  player = this._player.asReadonly();

  constructor() {
    this.loadPlayerFromLocalStorage();
  }

  private loadPlayerFromLocalStorage() {
    const stored = localStorage.getItem('player');
    if (stored) {
      try {
        const p: Player = JSON.parse(stored);
        this._player.set(p);
      } catch {
        localStorage.removeItem('player');
      }
    }
  }

  createPlayer(name: string): Observable<Player> {
    const url = `${this.urlPlayer}`;
    const body = { name: name.trim() };

    return this.http.post<Player>(url, body).pipe(
      tap((p) => {
        this._player.set(p);
        localStorage.setItem('player', JSON.stringify(p));
      })
    );
  }

  getPlayer(id: string): Observable<Player> {
    const url = `${this.urlPlayer}/${id}`;

    return this.http.get<Player>(url).pipe(
      tap((p) => {
        this._player.set(p);
        localStorage.setItem('player', JSON.stringify(p));
      })
    );
  }

  updatePlayerName(id: string, name: string): Observable<Player> {
    const url = `${this.urlPlayer}/${id}`;
    const body = { name: name.trim() };

    return this.http.put<Player>(url, body).pipe(
      tap((p) => {
        this._player.set(p);
        localStorage.setItem('player', JSON.stringify(p));
      }),
      catchError((error) => {
        if (error.status === 404) {
          return this.createPlayer(name);
        }
        return throwError(() => error);
      })
    );
  }
}

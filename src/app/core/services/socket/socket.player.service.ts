import { inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class SocketPlayerService {
  private http = inject(HttpClient);
  player = signal<Player | null>(null);

  createPlayer(name: string): Observable<Player> {
    const url = `${baseUrl}/api/player`;
    const body = { name: name.trim() };

    return this.http.post<Player>(url, body);
  }
}

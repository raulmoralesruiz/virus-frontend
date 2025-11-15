import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable, tap } from 'rxjs';
import { Room, createDefaultRoomConfig } from '../../models/room.model';
import { ApiPlayerService } from './api.player.service';

@Injectable({ providedIn: 'root' })
export class ApiRoomService {
  private http = inject(HttpClient);
  private apiPlayerService = inject(ApiPlayerService);
  private urlRoom = environment.baseUrl + '/room';

  private _roomList = signal<Room[]>([]);
  private _currentRoom = signal<Room | null>(null);

  /** --- Getters reactivos --- **/
  roomList = this._roomList.asReadonly();
  currentRoom = this._currentRoom.asReadonly();

  constructor() {
    this.loadCurrentRoomFromLocalStorage();
  }

  /** --- Persistencia local --- **/
  private loadCurrentRoomFromLocalStorage() {
    const stored = localStorage.getItem('currentRoom');
    if (stored) {
      try {
        const r: Room = JSON.parse(stored);
        this._currentRoom.set(this.normalizeRoom(r));
      } catch {
        localStorage.removeItem('currentRoom');
      }
    }
  }

  private saveCurrentRoomToLocalStorage(room: Room) {
    localStorage.setItem('currentRoom', JSON.stringify(room));
  }

  /** --- API REST --- **/
  getRoomList(): Observable<Room[]> {
    const url = `${this.urlRoom}`;

    return this.http
      .get<Room[]>(url)
      .pipe(
        map((rooms) => rooms.map((room) => this.normalizeRoom(room))),
        tap((rooms) => this._roomList.set(rooms))
      );
  }

  getRoomById(id: string): Observable<Room> {
    const url = `${this.urlRoom}/${id}`;

    return this.http.get<Room>(url).pipe(
      map((room) => this.normalizeRoom(room)),
      tap((room) => {
        this.setCurrentRoom(room);
      })
    );
  }

  createRoom(playerId: string): Observable<Room> {
    const url = `${this.urlRoom}`;
    const body = { playerId };

    return this.http.post<Room>(url, body).pipe(
      map((room) => this.normalizeRoom(room)),
      tap((room) => {
        this.setCurrentRoom(room);
      })
    );
  }

  joinRoom(roomId: string): Observable<Room> {
    const playerId = this.apiPlayerService.player()?.id;
    if (!playerId)
      throw new Error('No existe el jugador para unirse a la sala');

    const url = `${this.urlRoom}/join/${roomId}`;
    const body = { playerId };

    return this.http.post<Room>(url, body).pipe(
      map((room) => this.normalizeRoom(room)),
      tap((room) => {
        this.setCurrentRoom(room);
      })
    );
  }

  /** --- Métodos de utilidad --- **/
  setCurrentRoom(room: Room) {
    const normalized = this.normalizeRoom(room);
    this._currentRoom.set(normalized);
    this.saveCurrentRoomToLocalStorage(normalized);
    return normalized;
  }

  clearCurrentRoom() {
    this._currentRoom.set(null);
    localStorage.removeItem('currentRoom');
  }

  private normalizeRoom(room: Room): Room {
    return {
      ...room,
      config: room.config ?? createDefaultRoomConfig(),
    };
  }
}

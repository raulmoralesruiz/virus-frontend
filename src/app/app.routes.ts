import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'room-list',
    loadComponent: () =>
      import('./features/room-list/room-list.component').then(
        (m) => m.RoomListComponent,
      ),
  },
  {
    path: 'room/:id',
    loadComponent: () =>
      import('./features/room/room.component').then((m) => m.RoomComponent),
  },
  {
    path: 'game/:id',
    loadComponent: () =>
      import('./features/game/game.component').then((m) => m.GameComponent),
  },
  { path: '**', redirectTo: 'home' },
];

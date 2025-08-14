import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { RoomListComponent } from './features/room-list/room-list.component';
import { RoomComponent } from './features/room/room.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'room-list', component: RoomListComponent },
  // { path: 'room', component: RoomComponent },
  { path: 'room/:id', component: RoomComponent }, // ruta para una sala concreta
  { path: '**', redirectTo: 'home' },
];

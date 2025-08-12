import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [],
})
export class HomeComponent {
  constructor(private playerService: PlayerService, private router: Router) {}

  setName(name: string) {
    if (!name.trim()) return;
    this.playerService.setPlayer(name);
    this.router.navigate(['/room-list']);
  }
}

import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';
import { Router } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [],
})
export class HomeComponent implements OnInit {
  constructor(
    private socketService: SocketService,
    private playerService: PlayerService,
    private router: Router
  ) {
    // this.socketService.connect();
  }

  ngOnInit() {
    this.socketService.connect();
  }

  setName(name: string) {
    if (!name.trim()) return;
    this.playerService.setPlayer(name);
    this.router.navigate(['/room-list']);
  }
}

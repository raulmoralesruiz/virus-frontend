import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import { Card } from '../../core/models/card.model';
import { PublicGameState } from '../../core/models/game.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-game',
  imports: [DatePipe],
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameStore = inject(GameStoreService);

  publicState: Signal<PublicGameState | null> = this.gameStore.publicState;
  hand: Signal<Card[]> = this.gameStore.hand;

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (!roomId) return;

    // Pedimos el estado inicial de la partida
    this.gameStore.getState(roomId);
  }

  startGame() {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.gameStore.startGame(roomId);
    }
  }
}

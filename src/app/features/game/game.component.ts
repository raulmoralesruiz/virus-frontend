import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import { Card } from '../../core/models/card.model';
import { PublicGameState } from '../../core/models/game.model';
import { GameErrorComponent } from './components/game-error/game-error';
import { GameInfoComponent } from './components/game-info/game-info';
import { GameTurnComponent } from './components/game-turn/game-turn';
import { GameBoardComponent } from './components/game-board/game-board';
import { GameHandComponent } from './components/game-hand/game-hand';
import { GameWinnerComponent } from './components/game-winner/game-winner';

@Component({
  selector: 'app-game',
  imports: [
    GameErrorComponent,
    GameInfoComponent,
    GameTurnComponent,
    GameBoardComponent,
    GameHandComponent,
    GameWinnerComponent,
  ],
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameStore = inject(GameStoreService);

  publicState: Signal<PublicGameState | null> = this.gameStore.publicState;
  hand: Signal<Card[]> = this.gameStore.hand;
  roomId!: string;

  lastError = this.gameStore.lastError;
  isMyTurn = this.gameStore.isMyTurn;
  remainingSeconds = this.gameStore.remainingSeconds;
  winner = this.gameStore.winner;

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (!roomId) return;

    this.roomId = roomId;
    // Pedimos el estado inicial de la partida
    this.gameStore.getState(roomId);
  }

  startGame() {
    if (this.roomId) this.gameStore.startGame(this.roomId);
  }

  draw() {
    if (this.roomId) this.gameStore.drawCard(this.roomId);
  }

  endTurn() {
    this.gameStore.endTurn(this.roomId);
  }

  isGameEnded(): boolean {
    return !!this.gameStore.winner();
  }

  resetGame() {
    if (this.roomId) this.gameStore.resetRoom(this.roomId);
  }

  goHome() {
    this.gameStore.goHome();
  }
}

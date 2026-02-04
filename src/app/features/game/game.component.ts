import { Component, OnInit, Signal, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import { RoomStoreService } from '../../core/services/room-store.service';
import { Card } from '../../core/models/card.model';
import { PublicGameState } from '../../core/models/game.model';
import { GameErrorComponent } from './components/game-error/game-error';
import { GameInfoComponent } from './components/game-info/game-info';
import { GameBoardComponent } from './components/game-board/game-board';
import { GameHandComponent } from './components/game-hand/game-hand';
import { GameWinnerComponent } from './components/game-winner/game-winner';
import { GameEmptyComponent } from './components/game-empty/game-empty.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { GameLeaveComponent } from './components/game-leave/game-leave.component';

@Component({
  selector: 'app-game',
  imports: [
    GameErrorComponent,
    GameInfoComponent,
    GameBoardComponent,
    GameHandComponent,
    GameWinnerComponent,
    GameEmptyComponent,
    GameHistoryComponent,
    GameLeaveComponent,
  ],
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected gameStore = inject(GameStoreService);
  private roomStore = inject(RoomStoreService);

  publicState: Signal<PublicGameState | null> = this.gameStore.publicState;
  currentRoom = this.roomStore.currentRoom;
  hand: Signal<Card[]> = this.gameStore.hand;
  history: Signal<string[]> = this.gameStore.history;
  roomId!: string;

  lastError = this.gameStore.lastError;
  isMyTurn = this.gameStore.isMyTurn;
  remainingSeconds = this.gameStore.remainingSeconds;
  winner = this.gameStore.winner;
  showHistory = this.gameStore.historyOpen;
  showLeave = this.gameStore.leavingOpen;

  ngOnInit() {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (!roomId) return;
    this.roomId = roomId;
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

  leaveAfterWin() {
    if (this.roomId) this.gameStore.leaveGame(this.roomId);
    else this.gameStore.goToRoomList();
  }

  handleTurnTimeout() {
    if (this.roomId) this.gameStore.handleTurnTimeout(this.roomId);
  }

  dismissError() {
    this.gameStore.clearError();
  }

  @ViewChild(GameHandComponent) gameHand!: GameHandComponent;

  handleFailedExperiment(event: {
    card: Card;
    target: { organId: string; playerId: string };
  }) {
    this.gameHand.selectCardAndTarget(event.card, event.target);
  }

  handleBodySwap(event: { card: Card }) {
    this.gameHand.selectCardToPlay(event.card);
  }

  handleApparition(event: { card: Card }) {
    this.gameHand.selectCardToPlay(event.card);
  }
}

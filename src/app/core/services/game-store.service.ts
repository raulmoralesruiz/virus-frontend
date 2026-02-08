import { Injectable, computed, inject } from '@angular/core';
import { SocketGameService } from '../services/socket/socket.game.service';
import { ApiPlayerService } from './api/api.player.service';
import { RoomStoreService } from './room-store.service';
import { AnyPlayTarget } from '../models/game-actions.model';
import { GameNavigationService } from './game/game-navigation.service';
import { GameUiService } from './game/game-ui.service';
import { GamePlayService } from './game/game-play.service';

@Injectable({ providedIn: 'root' })
export class GameStoreService {
  private socketGame = inject(SocketGameService);
  private apiPlayer = inject(ApiPlayerService);
  private roomStore = inject(RoomStoreService);
  
  // Injected to ensure initialization of effects
  private nav = inject(GameNavigationService);
  private ui = inject(GameUiService);
  private play = inject(GamePlayService);

  // Estado público de la partida
  publicState = this.socketGame.publicState;
  hand = this.socketGame.hand;
  lastError = this.socketGame.lastError;
  winner = this.socketGame.winner;

  // Estado UI
  historyOpen = this.ui.historyOpen;
  leavingOpen = this.ui.leavingOpen;

  // Selectores
  isMyTurn = computed(() => {
    const state = this.publicState();
    const me = this.apiPlayer.player();
    if (!state || !me) return false;
    return state.players[state.turnIndex]?.player.id === me.id;
  });

  remainingSeconds = computed(() => this.publicState()?.remainingSeconds ?? 0);
  history = computed(() => this.publicState()?.history ?? []);

  // Actions delegated to SocketGameService (State related)
  startGame(roomId: string) { this.socketGame.startGame(roomId); }
  getState(roomId: string) { this.socketGame.requestGameState(roomId); }
  drawCard(roomId: string) { this.socketGame.drawCard(roomId); }
  endTurn(roomId: string) { this.socketGame.endTurn(roomId); }
  resetRoom(roomId: string) { this.socketGame.resetRoom(roomId); }
  setClientError(msg: string) { this.socketGame.setClientError(msg); }
  clearError() { this.socketGame.clearLastError(); }

  // Actions delegated to GamePlayService
  playCard(roomId: string, cardId: string, target?: AnyPlayTarget) {
    this.play.playCard(roomId, cardId, target);
  }

  discardCards(roomId: string, cardIds: string[]) {
    this.play.discardCards(roomId, cardIds);
  }

  handleTurnTimeout(roomId: string) {
    this.play.handleTurnTimeout(roomId);
  }

  // Actions delegated to GameNavigationService
  goHome() { this.nav.goHome(); }
  goToRoomList() { this.nav.goToRoomList(); }

  // Actions delegated to GameUiService
  openHistoryModal() { this.ui.openHistoryModal(); }
  closeHistoryModal() { this.ui.closeHistoryModal(); }
  openLeaveModal() { this.ui.openLeaveModal(); }
  closeLeaveModal() { this.ui.closeLeaveModal(); }

  // Complex action (state + navigation + UI)
  leaveGame(roomId: string) {
    const player = this.apiPlayer.player();
    if (!player) return;

    this.socketGame.leaveGame(roomId);
    this.roomStore.leaveRoom(roomId, player);
    this.ui.reset();
    this.nav.goToRoomList();
  }
}

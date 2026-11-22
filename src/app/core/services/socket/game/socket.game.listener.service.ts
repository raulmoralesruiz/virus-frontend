import { Injectable, inject } from '@angular/core';
import { SocketService } from '../socket.service';
import { SocketGameStateService } from './socket.game.state.service';
import { ApiPlayerService } from '../../api/api.player.service';
import { TimerSoundService } from '../../timer-sound.service';
import { GAME_CONSTANTS } from '../../../constants/game.constants';
import {
  BaseGamePayload,
  GameEndPayload,
  GameHandPayload,
  PublicGameState,
} from '../../../models/game.model';

@Injectable({ providedIn: 'root' })
export class SocketGameListenerService {
  private socket = inject(SocketService);
  private state = inject(SocketGameStateService);
  private playerService = inject(ApiPlayerService);
  private sound = inject(TimerSoundService);

  constructor() {
    this.registerListeners();
  }

  private registerListeners() {
    this.socket.on(GAME_CONSTANTS.GAME_STARTED, (s) => this.onGameStarted(s));
    this.socket.on(GAME_CONSTANTS.GAME_HAND, (d) => this.onGameHand(d));
    this.socket.on(GAME_CONSTANTS.GAME_STATE, (s) => this.onGameState(s));
    this.socket.on(GAME_CONSTANTS.GAME_ERROR, (e) => this.onGameError(e));
    this.socket.on(GAME_CONSTANTS.GAME_END, (d) => this.onGameEnd(d));
    this.socket.on(GAME_CONSTANTS.ROOM_RESET, (d) => this.onRoomReset(d));
    this.socket.on(GAME_CONSTANTS.EMOTE, (d) => this.onEmote(d));
  }

  private isRoomValid(roomId: string): boolean {
    return !this.state.activeRoomId || roomId === this.state.activeRoomId;
  }

  private onGameStarted(state: PublicGameState) {
    if (!this.isRoomValid(state.roomId)) return;
    this.state.setActiveRoomId(state.roomId);
    this.state.setPublicState(state);
    this.state.setWinner(null);
    this.sound.startMusic();
  }

  private onGameHand(data: GameHandPayload) {
    if (!this.isRoomValid(data.roomId)) return;
    const myId = this.playerService.player()?.id;
    if (myId && data.playerId === myId) {
      this.state.setHand(data.hand);
    }
  }

  private onGameState(state: PublicGameState | null) {
    if (!state) {
      this.state.reset();
      return;
    }
    if (!this.isRoomValid(state.roomId)) return;
    this.state.setActiveRoomId(state.roomId);
    this.state.setPublicState(state);
    // Partida en curso (incluye reconexión a mitad de partida): la BGM debe estar sonando.
    if (!state.winner) {
      this.sound.startMusic();
    }
  }

  private onGameError(err: { code: string; message: string }) {
    this.state.setLastError(err.message ?? 'Unknown error');
  }

  private onEmote(data: { roomId: string; playerId: string; emote: string; at?: number }) {
    if (!this.isRoomValid(data.roomId)) return;
    const state = this.state.publicState();
    const playerName =
      state?.players.find((p) => p.player.id === data.playerId)?.player.name ?? 'Jugador';
    this.state.addEmote({
      roomId: data.roomId,
      playerId: data.playerId,
      playerName,
      emote: data.emote,
      at: data.at ?? Date.now(),
    });
  }

  private onGameEnd(data: GameEndPayload) {
    if (!this.isRoomValid(data.roomId)) return;
    const hasPublicState = !!this.state.publicState();
    if (!data.winner && !hasPublicState) this.state.reset();
    this.state.setWinner(data.winner);
    this.sound.stopMusic();
  }

  private onRoomReset(data: BaseGamePayload) {
    if (!this.isRoomValid(data.roomId)) return;
    this.state.reset();
    this.sound.stopMusic();
  }
}

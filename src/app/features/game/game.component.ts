import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import { Card, CardColor } from '../../core/models/card.model';
import {
  OrganOnBoard,
  PlayCardTarget,
  PublicGameState,
  PublicPlayerInfo,
} from '../../core/models/game.model';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ApiPlayerService } from '../../core/services/api/api.player.service';

@Component({
  selector: 'app-game',
  imports: [DatePipe, TitleCasePipe],
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameStore = inject(GameStoreService);
  private apiPlayer = inject(ApiPlayerService);

  publicState: Signal<PublicGameState | null> = this.gameStore.publicState;
  hand: Signal<Card[]> = this.gameStore.hand;
  roomId!: string;

  lastError = this.gameStore.lastError;
  isMyTurn = this.gameStore.isMyTurn;
  remainingSeconds = this.gameStore.remainingSeconds;

  selectedCard: Card | null = null;
  targetOptions: { label: string; playerId: string; organId: string }[] = [];
  selectedTarget: PlayCardTarget | null = null;

  cardColors = Object.values(CardColor);

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

  // Helper para plantilla: obtener el órgano de un jugador por color
  getOrganByColor(
    p: PublicPlayerInfo,
    color: CardColor
  ): OrganOnBoard | undefined {
    return p.board.find((o) => o.color === color);
  }

  // Maneja el cambio del <select>
  onTargetChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      this.selectedTarget = null;
      return;
    }
    const [organId, playerId] = value.split('|');
    this.selectedTarget = { organId, playerId };
  }

  selectCardToPlay(card: Card) {
    this.selectedCard = card;
    this.targetOptions = [];

    const st = this.publicState();
    if (!st) return;

    if (card.kind === 'virus' || card.kind === 'medicine') {
      // construir lista de órganos posibles (de todos los jugadores)
      for (const p of st.players) {
        for (const o of p.board) {
          this.targetOptions.push({
            label: `${p.player.name} · ${o.color}`,
            playerId: p.player.id,
            organId: o.id,
          });
        }
      }
    }
  }

  confirmPlayCard() {
    if (!this.selectedCard) return;
    console.log('➡️ confirmPlayCard', {
      card: this.selectedCard,
      target: this.selectedTarget,
    });

    const st = this.publicState();
    const me = this.apiPlayer.player();
    if (!st || !me) return;

    if (
      (this.selectedCard.kind === 'virus' ||
        this.selectedCard.kind === 'medicine') &&
      !this.selectedTarget
    ) {
      alert('Debes seleccionar un objetivo');
      return;
    }

    this.playCard(this.selectedCard.id, this.selectedTarget || undefined);

    // limpiar selección
    this.selectedCard = null;
    this.selectedTarget = null;
    this.targetOptions = [];
  }

  playCard(cardId: string, target?: { playerId: string; organId: string }) {
    const st = this.publicState();
    if (!st) return;

    // ✅ delegamos en store (ya se encarga de meter playerId)
    this.gameStore.playCard(st.roomId, cardId, target);
  }
}

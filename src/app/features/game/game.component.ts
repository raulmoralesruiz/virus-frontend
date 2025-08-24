import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import { Card } from '../../core/models/card.model';
import { PlayCardTarget, PublicGameState } from '../../core/models/game.model';
import { DatePipe } from '@angular/common';
import { ApiPlayerService } from '../../core/services/api/api.player.service';

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
  roomId!: string;

  lastError = this.gameStore.lastError;
  isMyTurn = this.gameStore.isMyTurn;
  remainingSeconds = this.gameStore.remainingSeconds;

  selectedCard: Card | null = null;
  targetOptions: { label: string; playerId: string; organId: string }[] = [];
  selectedTarget: PlayCardTarget | null = null;

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
    if (card.kind === 'virus') {
      const st = this.publicState();
      if (!st) return;

      this.targetOptions = [];
      for (const p of st.players) {
        for (const c of p.board) {
          if (c.kind === 'organ') {
            this.targetOptions.push({
              label: `${p.player.name} · ${c.id}`,
              playerId: p.player.id,
              organId: c.id,
            });
          }
        }
      }

      if (this.targetOptions.length === 0) {
        alert('No hay órganos a los que atacar');
        return;
      }

      this.selectedCard = card;
      this.selectedTarget = null; // aún no elegido
    } else {
      // órganos, medicinas...
      this.playCard(card.id);
    }
  }

  confirmPlayCard() {
    if (!this.selectedCard) return;

    if (this.selectedCard.kind === 'virus') {
      if (!this.selectedTarget) {
        alert('Debes seleccionar un objetivo');
        return;
      }
      this.playCard(this.selectedCard.id, this.selectedTarget);
    } else {
      this.playCard(this.selectedCard.id);
    }

    // limpiar selección
    this.selectedCard = null;
    this.selectedTarget = null;
  }

  playCard(cardId: string, target?: { playerId: string; organId: string }) {
    const st = this.publicState();
    if (!st) return;

    // ✅ delegamos en store (ya se encarga de meter playerId)
    this.gameStore.playCard(st.roomId, cardId, target);
  }
}

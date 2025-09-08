import { Component, OnInit, Signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStoreService } from '../../core/services/game-store.service';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../core/models/card.model';
import {
  AnyPlayTarget,
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
  selectedTargetA: PlayCardTarget | null = null; // para transplant
  selectedTargetB: PlayCardTarget | null = null; // para transplant
  selectedCardsToDiscard: Card[] = [];

  contagionAssignments: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[] = [];

  cardColors = Object.values(CardColor);

  // referencias públicas a los enums
  CardKind = CardKind;
  TreatmentSubtype = TreatmentSubtype;

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

  onTargetChange(event: Event, which: 'A' | 'B' | 'single' = 'single') {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      if (which === 'A') this.selectedTargetA = null;
      else if (which === 'B') this.selectedTargetB = null;
      else this.selectedTarget = null;
      return;
    }

    const [organId, playerId] = value.split('|');
    const target = { organId, playerId };

    if (which === 'A') this.selectedTargetA = target;
    else if (which === 'B') this.selectedTargetB = target;
    else this.selectedTarget = target;
  }

  onContagionTargetChange(event: Event, idx: number) {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      this.contagionAssignments[idx].toOrganId = '';
      this.contagionAssignments[idx].toPlayerId = '';
      return;
    }
    const [organId, playerId] = value.split('|');
    this.contagionAssignments[idx].toOrganId = organId;
    this.contagionAssignments[idx].toPlayerId = playerId;
  }

  selectCardToPlay(card: Card) {
    this.selectedCard = card;
    this.targetOptions = [];

    const st = this.publicState();
    if (!st) return;

    if (card.kind === CardKind.Virus || card.kind === CardKind.Medicine) {
      // órganos de todos
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

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.Transplant:
        case TreatmentSubtype.OrganThief:
          for (const p of st.players) {
            for (const o of p.board) {
              this.targetOptions.push({
                label: `${p.player.name} · ${o.color}`,
                playerId: p.player.id,
                organId: o.id,
              });
            }
          }
          break;

        case TreatmentSubtype.MedicalError:
          for (const p of st.players) {
            if (p.player.id !== this.apiPlayer.player()?.id) {
              this.targetOptions.push({
                label: p.player.name,
                playerId: p.player.id,
                organId: '', // no aplica
              });
            }
          }
          break;

        case TreatmentSubtype.Gloves:
          // sin target
          break;

        case TreatmentSubtype.Contagion:
          this.contagionAssignments = [];
          const me = this.apiPlayer.player();
          const self = st.players.find((p) => p.player.id === me?.id);
          if (!self) return;

          for (const o of self.board) {
            const virusCount = o.attached.filter(
              (a) => a.kind === 'virus'
            ).length;
            for (let i = 0; i < virusCount; i++) {
              this.contagionAssignments.push({
                fromOrganId: o.id,
                toOrganId: '',
                toPlayerId: '',
              });
            }
          }
          break;
      }
    }
  }

  confirmPlayCard() {
    if (!this.selectedCard) return;

    const st = this.publicState();
    const me = this.apiPlayer.player();
    if (!st || !me) return;

    let target: any = undefined;

    if (this.selectedCard.kind === CardKind.Treatment) {
      switch (this.selectedCard.subtype) {
        case TreatmentSubtype.Transplant:
          if (!this.selectedTargetA || !this.selectedTargetB) {
            alert('Debes seleccionar 2 órganos para el trasplante');
            return;
          }
          target = { a: this.selectedTargetA, b: this.selectedTargetB };
          break;

        case TreatmentSubtype.OrganThief:
          if (!this.selectedTarget) {
            alert('Debes seleccionar un órgano');
            return;
          }
          target = this.selectedTarget;
          break;

        case TreatmentSubtype.MedicalError:
          if (!this.selectedTarget) {
            alert('Debes seleccionar un jugador');
            return;
          }
          target = { playerId: this.selectedTarget.playerId };
          break;

        case TreatmentSubtype.Gloves:
          // sin target
          break;

        case TreatmentSubtype.Contagion:
          if (!this.contagionAssignments.length) {
            alert('Debes seleccionar los contagios');
            return;
          }
          this.gameStore.playCard(
            st.roomId,
            this.selectedCard.id,
            this.contagionAssignments
          );

          // limpiar selección
          this.selectedCard = null;
          this.selectedTarget = null;
          this.selectedTargetA = null;
          this.selectedTargetB = null;
          this.contagionAssignments = [];
          this.targetOptions = [];
          return;
      }
    } else if (
      this.selectedCard.kind === CardKind.Virus ||
      this.selectedCard.kind === CardKind.Medicine
    ) {
      if (!this.selectedTarget) {
        alert('Debes seleccionar un órgano');
        return;
      }
      target = this.selectedTarget;
    }

    this.playCard(this.selectedCard.id, target);

    // limpiar selección
    this.selectedCard = null;
    this.selectedTarget = null;
    this.selectedTargetA = null;
    this.selectedTargetB = null;
    this.targetOptions = [];
    this.contagionAssignments = [];
  }

  playCard(cardId: string, target?: AnyPlayTarget) {
    const st = this.publicState();
    if (!st) return;

    // ✅ delegamos en store (ya se encarga de meter playerId)
    this.gameStore.playCard(st.roomId, cardId, target);
  }

  // marcar/desmarcar cartas
  toggleDiscardSelection(card: Card) {
    const idx = this.selectedCardsToDiscard.findIndex((c) => c.id === card.id);
    if (idx >= 0) {
      this.selectedCardsToDiscard.splice(idx, 1); // quitar
    } else {
      this.selectedCardsToDiscard.push(card); // añadir
    }
  }

  // enviar a descarte
  discardSelectedCards() {
    if (!this.roomId || this.selectedCardsToDiscard.length === 0) return;
    this.gameStore.discardCards(
      this.roomId,
      this.selectedCardsToDiscard.map((c) => c.id)
    );
    this.selectedCardsToDiscard = [];
  }
}

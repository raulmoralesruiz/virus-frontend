import { Component, inject, Input } from '@angular/core';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../core/models/card.model';
import { HandCard } from './hand-card/hand-card';
import {
  PublicGameState,
  PlayCardTarget,
  AnyPlayTarget,
} from '../../../../core/models/game.model';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'game-hand',
  standalone: true,
  imports: [HandCard, DragDropModule],
  templateUrl: './game-hand.html',
  styleUrl: './game-hand.css',
})
export class GameHandComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  @Input() hand: Card[] = [];
  @Input() isMyTurn: boolean = false;
  @Input() roomId!: string;
  @Input() publicState!: PublicGameState | null;
  @Input() gameEnded: boolean = false;

  // Estado interno
  selectedCard: Card | null = null;
  selectedCardsToDiscard: Card[] = [];
  targetOptions: { label: string; playerId: string; organId: string }[] = [];
  selectedTarget: PlayCardTarget | null = null;
  selectedTargetA: PlayCardTarget | null = null;
  selectedTargetB: PlayCardTarget | null = null;

  contagionAssignments: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[] = [];

  // referencias públicas
  CardKind = CardKind;
  TreatmentSubtype = TreatmentSubtype;
  cardColors = Object.values(CardColor);

  // Construye la lista de ids de TODOS los slots (player x color).
  // El hand list se conectará a todos esos slots.
  boardIds(): string[] {
    if (!this.publicState) return [];
    const ids: string[] = [];
    for (const p of this.publicState.players) {
      for (const color of this.cardColors) {
        ids.push(`slot-${p.player.id}-${color}`);
      }
    }
    return ids;
  }

  onExitHand(event: any) {
    console.log(
      `[EXIT] Carta ${JSON.stringify(event.item.data.id)} salió de mano`
    );
  }

  toggleDiscardSelection(card: Card) {
    const idx = this.selectedCardsToDiscard.findIndex((c) => c.id === card.id);
    if (idx >= 0) this.selectedCardsToDiscard.splice(idx, 1);
    else this.selectedCardsToDiscard.push(card);
  }

  discardSelectedCards() {
    if (!this.roomId || this.selectedCardsToDiscard.length === 0) return;
    this._gameStore.discardCards(
      this.roomId,
      this.selectedCardsToDiscard.map((c) => c.id)
    );
    this.selectedCardsToDiscard = [];
  }

  selectCardToPlay(card: Card) {
    this.selectedCard = card;
    this.targetOptions = [];

    const st = this.publicState;
    if (!st) return;

    if (card.kind === CardKind.Virus || card.kind === CardKind.Medicine) {
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
            if (p.player.id !== this._apiPlayer.player()?.id) {
              this.targetOptions.push({
                label: p.player.name,
                playerId: p.player.id,
                organId: '',
              });
            }
          }
          break;
        case TreatmentSubtype.Contagion:
          this.contagionAssignments = [];
          const me = this._apiPlayer.player();
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

  confirmPlayCard() {
    if (!this.selectedCard) return;

    const st = this.publicState;
    const me = this._apiPlayer.player();
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
        case TreatmentSubtype.Contagion:
          if (!this.contagionAssignments.length) {
            alert('Debes seleccionar los contagios');
            return;
          }
          this._gameStore.playCard(
            st.roomId,
            this.selectedCard.id,
            this.contagionAssignments
          );
          this.clearSelection();
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
    this.clearSelection();
  }

  playCard(cardId: string, target?: AnyPlayTarget) {
    const st = this.publicState;
    if (!st) return;
    this._gameStore.playCard(st.roomId, cardId, target);
  }

  clearSelection() {
    this.selectedCard = null;
    this.selectedTarget = null;
    this.selectedTargetA = null;
    this.selectedTargetB = null;
    this.targetOptions = [];
    this.contagionAssignments = [];
  }
}

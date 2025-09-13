import { Component, computed, inject, input } from '@angular/core';
import { PlayerCardComponent } from './player-card/player-card';
import { TitleCasePipe } from '@angular/common';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import { PublicPlayerInfo } from '../../../../../core/models/game.model';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';

@Component({
  selector: 'player-board',
  standalone: true,
  imports: [PlayerCardComponent, TitleCasePipe, DragDropModule],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
})
export class PlayerBoardComponent {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }

  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  isActive = input(false);
  roomId = input.required<string>();

  cardColors = Object.values(CardColor);

  // connectedTo devuelve el id de la mano local (para permitir drops desde tu mano)
  connectedTo = computed(() => {
    const me = this._apiPlayer.player();
    if (!me) return [];
    return [`handList-${me.id}`];
  });

  onEnterBoard(event: any) {
    console.log(
      `[ENTER] Carta ${event.item.data.id} entró en tablero de ${
        this.player().player.name
      }`
    );
  }

  getOrganByColor(color: CardColor) {
    return this.player().board.find((o) => o.color === color);
  }

  // manejar drop en un HUECO concreto
  onSlotDrop(event: CdkDragDrop<any>, color: CardColor) {
    const card: Card = event.item.data;
    const meId = this._apiPlayer.player()?.id;
    const rid = this.roomId();

    // seguridad
    if (!rid || !meId) return;

    // Si es órgano: solo permitimos jugar órganos desde TU mano (isMe)
    if (card.kind === CardKind.Organ) {
      // si no soy yo, no se pueden poner órganos en el tablero de otro
      if (!this.isMe()) {
        this.gameStore.setClientError(
          'Solo puedes poner órganos en tu propio tablero.'
        );
        return;
      }

      // color debe ser compatible con el hueco (o órgano multi)
      if (card.color !== color && card.color !== CardColor.Multi) {
        this.gameStore.setClientError(
          `Órgano ${card.color} no válido para hueco ${color}`
        );
        return;
      }

      // Jugar carta órgano (sin target)
      this._gameStore.playCard(rid, card.id);
      return;
    }

    // Si es medicina o virus: debe existir un órgano en el hueco
    if (card.kind === CardKind.Medicine || card.kind === CardKind.Virus) {
      const organ = this.getOrganByColor(color);
      if (!organ) {
        this.gameStore.setClientError(
          `No hay órgano en hueco ${color} para aplicar ${card.kind}`
        );
        return;
      }

      // validación básica de color cliente-side (el servidor volverá a validar)
      if (
        card.color !== organ.color &&
        card.color !== CardColor.Multi &&
        organ.color !== CardColor.Multi
      ) {
        this.gameStore.setClientError(
          `${card.kind} ${card.color} no válida para órgano ${organ.color}`
        );
        return;
      }

      // target: órgano concreto en este jugador
      this._gameStore.playCard(rid, card.id, {
        organId: organ.id,
        playerId: this.player().player.id,
      });
      return;
    }

    if (card.kind === CardKind.Treatment) {
      switch (card.subtype) {
        case TreatmentSubtype.OrganThief:
          this.playOrganThief(color, card);
          return;

        default:
          this.gameStore.setClientError(
            `Tratamiento ${card.subtype} aún no implementado por drag-and-drop`
          );
          return;
      }
    }

    // otros tipos: ignoramos por ahora
    this.gameStore.setClientError(
      `Tipo de carta no manejado por drag-and-drop: ${card.kind}`
    );
  }

  playOrganThief(color: CardColor, card: Card) {
    const rid = this.roomId();
    const organ = this.getOrganByColor(color);

    if (this.isMe()) {
      this.gameStore.setClientError('No puedes robarte a ti mismo.');
      return;
    }

    if (!organ) {
      this.gameStore.setClientError(
        `No hay órgano en hueco ${color} para aplicar ${card.kind}`
      );
      return;
    }

    this.gameStore.playCard(rid, card.id, {
      organId: organ.id,
      playerId: this.player().player.id,
    });
  }
}

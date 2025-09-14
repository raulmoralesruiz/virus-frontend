import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  input,
  output,
  Output,
} from '@angular/core';
import { PlayerCardComponent } from './player-card/player-card';
import { TitleCasePipe } from '@angular/common';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  MedicalErrorTarget,
  PublicPlayerInfo,
} from '../../../../../core/models/game.model';
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

  // recibe el estado global de trasplante
  transplantState = input<{
    card: Card;
    firstOrgan: { organId: string; playerId: string } | null;
  } | null>(null);

  startTransplant = output<{
    card: Card;
    firstOrgan: { organId: string; playerId: string };
  }>();
  finishTransplant = output<{ organId: string; playerId: string }>();

  // ------------------------------------------------------------
  // Eventos de drag & drop
  // ------------------------------------------------------------
  onEnterBoard(event: any) {
    // entrada visual / debugging
    const card = event.item?.data;
    const who = this.player()?.player?.name;
    console.log(`[ENTER] Carta ${card?.id ?? card} entró en tablero de ${who}`);
  }

  /**
   * Maneja el drop sobre un hueco concreto (color).
   * Delegamos por tipo de carta a métodos auxiliares.
   */
  onSlotDrop(event: CdkDragDrop<any>, color: CardColor) {
    const card: Card = event.item.data;
    const rid = this.roomId();
    const meId = this._apiPlayer.player()?.id;

    if (!rid || !meId) return;

    switch (card.kind) {
      case CardKind.Organ:
        this.handleOrganDrop(card, color, rid);
        break;

      case CardKind.Medicine:
      case CardKind.Virus:
        this.handleMedicineOrVirusDrop(card, color, rid);
        break;

      case CardKind.Treatment:
        this.handleTreatmentDrop(card, color, rid);
        break;

      default:
        this._gameStore.setClientError(
          `Tipo de carta no manejado por drag-and-drop: ${card.kind}`
        );
    }
  }

  // ------------------------------------------------------------
  // Métodos auxiliares por tipo de carta
  // ------------------------------------------------------------

  private handleOrganDrop(card: Card, color: CardColor, rid: string) {
    if (!this.isMe()) {
      this._gameStore.setClientError(
        'Solo puedes poner órganos en tu propio tablero.'
      );
      return;
    }

    if (card.color !== color && card.color !== CardColor.Multi) {
      this._gameStore.setClientError(
        `Órgano ${card.color} no válido para hueco ${color}`
      );
      return;
    }

    this._gameStore.playCard(rid, card.id);
  }

  private handleMedicineOrVirusDrop(card: Card, color: CardColor, rid: string) {
    const organ = this.getOrganByColor(color);
    if (!organ) {
      this._gameStore.setClientError(
        `No hay órgano en hueco ${color} para aplicar ${card.kind}`
      );
      return;
    }

    if (
      card.color !== organ.color &&
      card.color !== CardColor.Multi &&
      organ.color !== CardColor.Multi
    ) {
      this._gameStore.setClientError(
        `${card.kind} ${card.color} no válida para órgano ${organ.color}`
      );
      return;
    }

    this._gameStore.playCard(rid, card.id, {
      organId: organ.id,
      playerId: this.player().player.id,
    });
  }

  private handleTreatmentDrop(card: Card, color: CardColor, rid: string) {
    switch (card.subtype) {
      case TreatmentSubtype.OrganThief:
        this.playOrganThief(color, card);
        break;

      case TreatmentSubtype.Transplant:
        this.startTransplantSelection(card, color);
        break;

      case TreatmentSubtype.MedicalError:
        this.playMedicalError(card);
        break;

      case TreatmentSubtype.Gloves:
        this.playGloves(card);
        break;

      default:
        this._gameStore.setClientError(
          `Tratamiento ${card.subtype} aún no implementado por drag-and-drop`
        );
    }
  }

  // ------------------------------------------------------------
  // Lógica específica de tratamientos
  // ------------------------------------------------------------
  playOrganThief(color: CardColor, card: Card) {
    const rid = this.roomId();
    const organ = this.getOrganByColor(color);

    if (this.isMe()) {
      this._gameStore.setClientError('No puedes robarte a ti mismo.');
      return;
    }

    if (!organ) {
      this._gameStore.setClientError(
        `No hay órgano en hueco ${color} para aplicar ${card.kind}`
      );
      return;
    }

    this._gameStore.playCard(rid, card.id, {
      organId: organ.id,
      playerId: this.player().player.id,
    });
  }

  private playMedicalError(card: Card) {
    const rid = this.roomId();
    const me = this._apiPlayer.player();
    const targetId = this.player().player.id;

    if (!rid || !me) return;

    if (targetId === me.id) {
      this._gameStore.setClientError(
        'No puedes jugar Error Médico sobre ti mismo.'
      );
      return;
    }

    this._gameStore.playCard(rid, card.id, {
      playerId: targetId,
    } as MedicalErrorTarget);
  }

  private playGloves(card: Card) {
    const rid = this.roomId();
    const me = this._apiPlayer.player();

    if (!rid || !me) return;

    // Gloves no necesita target
    this._gameStore.playCard(rid, card.id);

    this._gameStore.setClientError('Has jugado Guantes de Látex.');
  }

  /**
   * Comienza la selección para Trasplante: guardamos el primer órgano (A)
   * y avisamos al usuario para que seleccione el segundo órgano (B) haciendo click.
   */
  private startTransplantSelection(card: Card, color: CardColor) {
    const organ = this.getOrganByColor(color);
    if (!organ) {
      this._gameStore.setClientError(
        'Debes soltar el trasplante sobre un órgano válido.'
      );
      return;
    }

    this.startTransplant.emit({
      card,
      firstOrgan: { organId: organ.id, playerId: this.player().player.id },
    });
  }

  /**
   * Método público llamado al hacer click en un hueco cuando estamos en modo Transplant.
   * Si se pulsa en un órgano válido, termina el trasplante enviando la jugada al servidor.
   */
  onSlotClick(organ: any /* OrganOnBoard | undefined */, playerId: string) {
    // si no estamos en modo trasplante, no hacemos nada aquí
    if (!this.transplantState()) return;

    if (!organ) {
      this._gameStore.setClientError(
        'Debes seleccionar un órgano válido como segundo objetivo.'
      );
      return;
    }

    this.finishTransplant.emit({ organId: organ.id, playerId });
  }

  // ------------------------------------------------------------
  // Helpers para estilos visuales
  // ------------------------------------------------------------

  isTransplantMode(): boolean {
    return !!this.transplantState;
  }

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  getOrganByColor(color: CardColor) {
    return this.player().board.find((o) => o.color === color);
  }
}

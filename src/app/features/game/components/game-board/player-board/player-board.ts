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
  OrganOnBoard,
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

  // recibir la lista global de ids de huecos
  allSlotIds = input.required<string[]>();

  // --- Inputs / Outputs ---
  contagionState = input<{
    card: Card;
    assignments: {
      fromOrganId: string;
      toOrganId: string;
      toPlayerId: string;
    }[];
  } | null>(null);

  virusMoved = output<{
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }>();

  // 👇 nuevo output para contagio
  startContagion = output<{ card: Card }>();

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
  onDrop(event: CdkDragDrop<any>, color: CardColor, organ: OrganOnBoard) {
    if (this.contagionState()) {
      this.onVirusDrop(event, organ);
    } else {
      this.onSlotDrop(event, color);
    }
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

  onVirusDrop(event: CdkDragDrop<any>, organ: OrganOnBoard) {
    const data = event.item.data; // { fromOrganId, virusId }
    if (!this.contagionState()) return;

    console.log(`onVirusDrop - data:${JSON.stringify(data)}`);
    console.log(`onVirusDrop - organ:${JSON.stringify(organ)}`);

    // nueva validación: evitar mismo órgano
    if (data.fromOrganId === organ.id) {
      this._gameStore.setClientError(
        'Has dejado el virus en el mismo órgano, no tiene efecto.'
      );
      return;
    }

    // Validar: órgano destino debe estar libre
    if (
      organ.attached.some((a) => a.kind === 'virus' || a.kind === 'medicine')
    ) {
      this._gameStore.setClientError('El órgano destino no está libre.');
      return;
    }

    // actualizar frontend en caliente
    const me = this.player();
    const fromOrgan = me.board.find((o) => o.id === data.fromOrganId);
    if (fromOrgan) {
      const idx = fromOrgan.attached.findIndex((a) => a.id === data.virusId);
      if (idx >= 0) {
        const [virus] = fromOrgan.attached.splice(idx, 1);
        organ.attached.push(virus); // 👈 mover virus al destino
      }
    }

    this.virusMoved.emit({
      fromOrganId: data.fromOrganId,
      toOrganId: organ.id,
      toPlayerId: this.player().player.id,
    });
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

      case TreatmentSubtype.Contagion:
        this.playContagion(card);
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

  private playContagion(card: Card) {
    if (!this.isMe()) {
      this._gameStore.setClientError(
        'Solo puedes usar Contagio en tu propio turno.'
      );
      return;
    }
    this.startContagion.emit({ card });
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
  // getOrganByColor(color: CardColor): OrganOnBoard {
  //   return this.player().board.find((o) => o.color === color)!;
  // }
  getOrganByColor(color: CardColor): OrganOnBoard | null {
    return this.player().board.find((o) => o.color === color) ?? null;
  }

  // helper para construir la lista de ids a conectar para UN hueco concreto (excluye el propio)
  getConnectedIdsForSlot(color: CardColor): string[] {
    const me = this._apiPlayer.player();
    const result: string[] = [];

    // 1) la mano local (si existe)
    if (me) {
      result.push(`handList-${me.id}`);
    }

    // 2) todos los demás huecos (excepto este hueco concreto)
    const mySlotId = `slot-${this.player().player.id}-${color}`;
    const others = this.allSlotIds().filter((id) => id !== mySlotId);
    result.push(...others);

    return result;
  }

  onEnterBoard(event: any) {
    // entrada visual / debugging
    const card = event.item?.data;
    const who = this.player()?.player?.name;
    console.log(`[ENTER] Carta ${card?.id ?? card} entró en tablero de ${who}`);
  }
}

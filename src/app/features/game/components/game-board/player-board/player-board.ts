import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Input,
  input,
  output,
  Output,
  signal,
} from '@angular/core';
import { PlayerCardComponent } from './player-card/player-card';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  MedicalErrorTarget,
  OrganOnBoard,
  PublicGameState,
  PublicPlayerInfo,
} from '../../../../../core/models/game.model';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';
import { TimerSoundService } from '../../../../../core/services/timer-sound.service';

@Component({
  selector: 'player-board',
  standalone: true,
  imports: [PlayerCardComponent, DragDropModule],
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
  gameState = input.required<PublicGameState>();
  remainingSeconds = input(0);
  getTemporaryVirusesForOrgan =
    input.required<(organId: string, playerId: string) => Card[]>();
  hasTemporaryVirus =
    input.required<(organId: string, playerId: string) => boolean>();

  cardColors = Object.values(CardColor);
  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: '❤️',
    [CardColor.Green]: '🫃',
    [CardColor.Blue]: '🧠',
    [CardColor.Yellow]: '🦴',
    [CardColor.Multi]: '🌈',
  };

  // connectedTo devuelve el id de la mano local (para permitir drops desde tu mano)
  connectedTo = computed(() => {
    const me = this._apiPlayer.player();
    if (!me) return [];
    return [`handList-${me.id}`];
  });

  turnTimerState = computed<'idle' | 'running' | 'warning' | 'critical'>(() => {
    if (!this.isActive()) return 'idle';

    const seconds = this.remainingSeconds();
    if (seconds <= 5) return 'critical';
    if (seconds <= 10) return 'warning';
    return 'running';
  });

  turnDurationSeconds = signal(0);

  turnProgressPercent = computed(() => {
    const duration = this.turnDurationSeconds();
    if (duration <= 0) return 0;

    const ratio = this.remainingSeconds() / duration;
    return Math.max(0, Math.min(100, ratio * 100));
  });

  private readonly timerSoundService = inject(TimerSoundService);
  isMuted = this.timerSoundService.isMuted;

  constructor() {
    effect(() => {
      const remaining = this.remainingSeconds();
      const currentDuration = this.turnDurationSeconds();

      if (remaining > currentDuration) {
        this.turnDurationSeconds.set(remaining);
      }
    });

    effect(() => {
      const isActive = this.isActive();
      const isMe = this.isMe();
      const seconds = this.remainingSeconds(); // fuerza ejecución cada segundo
      const timerState = this.turnTimerState();

      if (!isActive || !isMe) {
        return;
      }

      this.playTickForState(timerState);
    });
  }

  private playTickForState(
    timerState: 'idle' | 'running' | 'warning' | 'critical'
  ) {
    if (this.isMuted()) {
      return; // No hacer nada si está silenciado
    }

    switch (timerState) {
      case 'running':
        this.timerSoundService.playTick('running');
        break;
      case 'warning':
        this.timerSoundService.playTick('warning');
        break;
      case 'critical':
        this.timerSoundService.playTick('critical');
        break;
      default:
        break;
    }
  }

  toggleMute() {
    this.timerSoundService.toggleMute();
  }

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
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null>(null);

  virusMoved = output<{
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
    virus: Card;
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
  boardDropListId(): string {
    return `board-${this.player().player.id}`;
  }

  boardEnterPredicate = (
    drag: CdkDrag,
    _drop: CdkDropList<any>
  ): boolean => {
    const data = drag.data as Card | { virusId: string } | undefined;
    if (!data) return false;

    if ('virusId' in (data as any)) {
      return false; // el tablero general no acepta virus en contagio
    }

    const card = data as Card;

    switch (card.kind) {
      case CardKind.Organ:
        return this.isMe();

      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
            return true; // guantes no necesitan objetivo

          case TreatmentSubtype.MedicalError: {
            const me = this._apiPlayer.player();
            return !!me && this.player().player.id !== me.id;
          }

          case TreatmentSubtype.Contagion:
            return this.isMe();

          default:
            return false;
        }

      default:
        return false;
    }
  };

  slotEnterPredicate = (drag: CdkDrag, _drop: CdkDropList<any>): boolean => {
    const data = drag.data as Card | { virusId: string } | undefined;
    if (!data) return false;

    if ('virusId' in (data as any)) {
      return true; // contagio: permitir mover virus a órganos
    }

    const card = data as Card;

    if (card.kind === CardKind.Organ) {
      return false; // órganos caen en el tablero completo
    }

    if (card.kind === CardKind.Treatment) {
      if (
        card.subtype === TreatmentSubtype.Gloves ||
        card.subtype === TreatmentSubtype.MedicalError ||
        card.subtype === TreatmentSubtype.Contagion
      ) {
        return false;
      }
    }

    return true;
  };

  onBoardDrop(event: CdkDragDrop<any>) {
    const rid = this.roomId();
    const card = event.item.data as Card | undefined;

    if (!rid || !card) return;

    switch (card.kind) {
      case CardKind.Organ:
        this.handleOrganDrop(card, rid);
        break;

      case CardKind.Treatment:
        this.handleBoardTreatmentDrop(card, rid);
        break;

      default:
        this._gameStore.setClientError(
          `No puedes soltar ${card.kind} en el tablero general.`
        );
        break;
    }
  }

  onDrop(event: CdkDragDrop<any>, color: CardColor, organ: OrganOnBoard) {
    if (this.contagionState()) {
      this.onVirusDrop(event, organ);
    } else {
      this.onSlotDrop(event, color);
    }
  }

  getOrganIcon(color: CardColor): string {
    return this.organIcons[color] ?? '❔';
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
        this.handleOrganDrop(card, rid, color);
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

  // Método mejorado para manejar el drop de virus
  onVirusDrop(event: CdkDragDrop<any>, organ: OrganOnBoard) {
    const data = event.item.data; // { fromOrganId, virusId }
    const contagionState = this.contagionState();
    if (!contagionState) return;

    console.log(`onVirusDrop - data:${JSON.stringify(data)}`);
    console.log(`onVirusDrop - organ:${JSON.stringify(organ)}`);

    // ===== VALIDACIONES =====

    // 1. Evitar mismo órgano
    if (data.fromOrganId === organ.id) {
      this._gameStore.setClientError(
        'No puedes mover el virus al mismo órgano.'
      );
      return;
    }

    // 2. Validar que es un órgano rival
    if (this.isMe()) {
      this._gameStore.setClientError(
        'No puedes contagiar tus propios órganos.'
      );
      return;
    }

    // 3. Verificar que el órgano destino está libre
    const hasAttached = organ.attached.some(
      (a) => a.kind === 'virus' || a.kind === 'medicine'
    );

    // Usar el método del parent para verificar virus temporales
    const hasTemporary = this.hasTemporaryVirus()(
      organ.id,
      this.player().player.id
    );

    if (hasAttached || hasTemporary) {
      this._gameStore.setClientError('El órgano destino no está libre.');
      return;
    }

    // 4. Buscar el órgano origen y el virus
    const gameState = this.gameState();
    let fromOrgan: OrganOnBoard | null = null;
    let sourcePlayer: any = null;

    for (const player of gameState.players) {
      const foundOrgan = player.board.find(
        (o: any) => o.id === data.fromOrganId
      );
      if (foundOrgan) {
        fromOrgan = foundOrgan;
        sourcePlayer = player;
        break;
      }
    }

    if (!fromOrgan) {
      this._gameStore.setClientError('No se encontró el órgano origen.');
      return;
    }

    const virus = fromOrgan.attached.find((a) => a.id === data.virusId);

    if (!virus) {
      this._gameStore.setClientError('No se encontró el virus a mover.');
      return;
    }

    // 5. Verificar compatibilidad de colores
    const isColorCompatible =
      virus.color === organ.color ||
      virus.color === CardColor.Multi ||
      organ.color === CardColor.Multi;

    if (!isColorCompatible) {
      this._gameStore.setClientError(
        `El virus ${virus.color} no es compatible con el órgano ${organ.color}.`
      );
      return;
    }

    // ===== EJECUTAR MOVIMIENTO =====
    // IMPORTANTE: NO modificar organ.attached directamente
    // Solo emitir el evento, el estado se maneja en game-board

    this.virusMoved.emit({
      fromOrganId: data.fromOrganId,
      toOrganId: organ.id,
      toPlayerId: this.player().player.id,
      virus: virus,
    });
  }

  // Método helper para verificar si un virus es temporal
  isTemporaryVirus(organId: string, virusId: string): boolean {
    const contagionState = this.contagionState();
    if (!contagionState) return false;

    return contagionState.temporaryViruses.some(
      (tv) => tv.organId === organId && tv.virus.id === virusId
    );
  }

  // ------------------------------------------------------------
  // Métodos auxiliares por tipo de carta
  // ------------------------------------------------------------

  private handleOrganDrop(card: Card, rid: string, color?: CardColor) {
    if (!this.isMe()) {
      this._gameStore.setClientError(
        'Solo puedes poner órganos en tu propio tablero.'
      );
      return;
    }

    if (
      color &&
      card.color !== color &&
      card.color !== CardColor.Multi
    ) {
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

  private handleBoardTreatmentDrop(card: Card, rid: string) {
    switch (card.subtype) {
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
          `Debes soltar ${card.subtype} sobre un objetivo válido.`
        );
        break;
    }
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

import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { PlayerCardComponent } from './player-card/player-card';
import {
  Card,
  CardColor,
  CardKind,
  TreatmentSubtype,
} from '../../../../../core/models/card.model';
import {
  articleForCard,
  cardWithArticle,
  describeCard,
  describeColor,
  describeOrgan,
  organWithArticle,
} from '../../../../../core/utils/card-label.utils';
import { isInfected, isVaccinated, isImmune } from '../../../../../core/utils/organ.utils';
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
import { DragDropService } from '../../../../../core/services/drag-drop.service';

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
  private dragDropService = inject(DragDropService);

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

  isValidBoardTarget = computed(() => {
    const dragged = this.dragDropService.draggedItem();
    if (!dragged) return false;

    // Solo nos interesa si es un Órgano y es MI tablero
    // dragged puede ser Card o {virusId...}
    if ('kind' in dragged) {
      const card = dragged as Card;
      
      if (card.kind === CardKind.Organ) {
          if (card.color === CardColor.Orange) {
              // Órgano mutante: NO se puede soltar en el tablero general (solo en slots)
              return false;
          }
          return this.isMe();
      }

      if (card.kind === CardKind.Treatment) {
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
            return true; // Todos los tableros

          case TreatmentSubtype.MedicalError:
          case TreatmentSubtype.trickOrTreat:
            return !this.isMe(); // Solo rivales

          case TreatmentSubtype.Contagion:
            return this.isMe(); // Solo propio
        }
      }
    }
    
    return false;
  });

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

    let wasActive = false;
    effect(() => {
      const isActive = this.isActive();
      const isMe = this.isMe();
      const seconds = this.remainingSeconds(); // fuerza ejecución cada segundo
      const timerState = this.turnTimerState();

      if (!isMe) {
        wasActive = false;
        return;
      }

      if (isActive && !wasActive) {
        this.timerSoundService.playTurnStart();
      }

      wasActive = isActive;

      if (!isActive) {
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

  startContagion = output<{ card: Card }>();
  startBodySwap = output<{ card: Card }>();
  startApparition = output<{ card: Card }>();

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

  startFailedExperiment = output<{
    card: Card;
    target: { organId: string; playerId: string };
  }>();

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
        // Órgano Mutante: NO permitir drop en tablero general (debe ser en un slot)
        // Órganos restantes: OK si es mi tablero
        if (card.color === CardColor.Orange) return false;
        return this.isMe();

      case CardKind.Treatment:
        switch (card.subtype) {
          case TreatmentSubtype.Gloves:
            return true; // guantes no necesitan objetivo

          case TreatmentSubtype.MedicalError: {
            const me = this._apiPlayer.player();
            return !!me && this.player().player.id !== me.id;
          }

          case TreatmentSubtype.trickOrTreat: {
            const me = this._apiPlayer.player();
            return !!me && this.player().player.id !== me.id;
          }

          case TreatmentSubtype.Contagion:
            return this.isMe();

          case TreatmentSubtype.BodySwap:
          case TreatmentSubtype.Apparition:
            return true;

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
      // Permitir soltar Órgano Mutante (Orange) en los huecos para reemplazar
      if (card.color === CardColor.Orange) return true;
      return false; // órganos restantes caen en el tablero completo
    }

    if (card.kind === CardKind.Treatment) {
      if (
        card.subtype === TreatmentSubtype.Gloves ||
        card.subtype === TreatmentSubtype.MedicalError ||
        card.subtype === TreatmentSubtype.Contagion ||
        card.subtype === TreatmentSubtype.trickOrTreat ||
        card.subtype === TreatmentSubtype.BodySwap ||
        card.subtype === TreatmentSubtype.Apparition
      ) {
        return false;
      }
    }

    return true;
  };

  // Drag over state for visual feedback
  isDragOver = signal(false);

  onBoardEnter(_event: any) {
    this.isDragOver.set(true);
  }

  onBoardExit(_event: any) {
    this.isDragOver.set(false);
  }

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

  onDrop(
    event: CdkDragDrop<any>,
    color: CardColor,
    organ?: OrganOnBoard | null
  ) {
    if (this.contagionState()) {
      if (!organ) {
        this._gameStore.setClientError(
          'Debes contagiar un órgano válido.'
        );
        return;
      }
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

    // Validación de color (Multicolor y Orange son comodines)
    if (
      color &&
      card.color !== color &&
      card.color !== CardColor.Multi &&
      card.color !== CardColor.Orange
    ) {
      const organLabel = describeOrgan(card.color);
      const slotLabel = describeColor(color);
      this._gameStore.setClientError(
        `El ${organLabel} no puede ocupar el hueco ${slotLabel}.`
      );
      return;
    }

    // Lógica de reemplazo para Órgano Mutante
    let target: any = undefined;
    if (card.color === CardColor.Orange && color) {
      const existingOrgan = this.getOrganByColor(color);
      if (existingOrgan) {
         target = { 
           organId: existingOrgan.id,
           playerId: this.player().player.id 
         };
      }
    }

    this._gameStore.playCard(rid, card.id, target);
  }

  private handleMedicineOrVirusDrop(card: Card, color: CardColor, rid: string) {
    const organ = this.getOrganByColor(color);
    if (!organ) {
      const slotOrgan = describeOrgan(color);
      const cardArticle = articleForCard(card).toLowerCase();
      const cardLabel = describeCard(card);
      this._gameStore.setClientError(
        `No hay un ${slotOrgan} disponible para aplicar ${cardArticle} ${cardLabel}.`
      );
      return;
    }

    if (
      card.color !== organ.color &&
      card.color !== CardColor.Multi &&
      organ.color !== CardColor.Multi
    ) {
      this._gameStore.setClientError(
        `${cardWithArticle(card)} no es compatible con ${organWithArticle(organ.color)}.`
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

      case TreatmentSubtype.colorThiefRed:
        this.playColorThief(card, color, CardColor.Red);
        break;
      case TreatmentSubtype.colorThiefGreen:
        this.playColorThief(card, color, CardColor.Green);
        break;
      case TreatmentSubtype.colorThiefBlue:
        this.playColorThief(card, color, CardColor.Blue);
        break;
      case TreatmentSubtype.colorThiefYellow:
        this.playColorThief(card, color, CardColor.Yellow);
        break;

      case TreatmentSubtype.Transplant:
      case TreatmentSubtype.AlienTransplant:
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

      case TreatmentSubtype.trickOrTreat:
        this.playTrickOrTreat(card);
        break;

      case TreatmentSubtype.failedExperiment:
        this.playFailedExperiment(card, color);
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

  playColorThief(card: Card, slotColor: CardColor, requiredColor: CardColor) {
    const rid = this.roomId();
    const organ = this.getOrganByColor(slotColor);

    if (this.isMe()) {
      this._gameStore.setClientError('No puedes robarte a ti mismo.');
      return;
    }

    if (!organ) {
      this._gameStore.setClientError(
        `No hay órgano en hueco ${slotColor} para aplicar ${card.kind}`
      );
      return;
    }

    // Validar organ color real vs required color
    if (organ.color !== requiredColor) {
       this._gameStore.setClientError(
        `No coincide el color del órgano`
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

  private playTrickOrTreat(card: Card) {
    const rid = this.roomId();
    const me = this._apiPlayer.player();
    const targetId = this.player().player.id;

    if (!rid || !me) return;

    if (targetId === me.id) {
      this._gameStore.setClientError('No puedes jugar Truco o Trato sobre ti mismo.');
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

      case TreatmentSubtype.trickOrTreat:
        this.playTrickOrTreat(card);
        break;

      case TreatmentSubtype.BodySwap:
        this.startBodySwap.emit({ card });
        break;

      case TreatmentSubtype.Apparition:
        this.startApparition.emit({ card });
        break;

      default:
        this._gameStore.setClientError(
          `Debes soltar ${card.subtype} sobre un objetivo válido.`
        );
        break;
    }
  }

  playContagion(card: Card) {
    if (!this.isMe()) {
      this._gameStore.setClientError(
        'Solo puedes usar Contagio en tu propio turno.'
      );
      return;
    }
    this.startContagion.emit({ card });
  }

  private playFailedExperiment(card: Card, color: CardColor) {
    const organ = this.getOrganByColor(color);
    if (!organ) {
      this._gameStore.setClientError(
        'Debes soltar la carta sobre un órgano válido.'
      );
      return;
    }

    // Validar que el órgano sea infectado o vacunado, y NO inmune
    if ((!isInfected(organ) && !isVaccinated(organ)) || isImmune(organ)) {
      this._gameStore.setClientError(
        'Solo puedes usar Experimento Fallido sobre órganos infectados o vacunados (no inmunes).'
      );
      return;
    }

    this.startFailedExperiment.emit({
      card,
      target: { organId: organ.id, playerId: this.player().player.id },
    });
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

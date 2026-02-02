import { Component, computed, inject, input, output, signal, effect } from '@angular/core';
import { DragDropService } from '../../../../../../core/services/drag-drop.service';
import { OrganOnBoard } from '../../../../../../core/models/game.model';
import { Card, CardKind, CardColor, TreatmentSubtype } from '../../../../../../core/models/card.model';
import { isInfected, isVaccinated, isImmune } from '../../../../../../core/utils/organ.utils';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CardIconComponent } from '../../../../../../shared/components/card-icon/card-icon.component';

@Component({
  selector: 'player-card',
  standalone: true,
  imports: [DragDropModule, CardIconComponent],
  templateUrl: './player-card.html',
  styleUrl: './player-card.css',
})
export class PlayerCardComponent {
  organ = input.required<OrganOnBoard>();
  isMe = input(false);
  contagionMode = input(false);
  temporaryViruses = input<Card[]>([]);

  dropListId = input.required<string>();
  dropListData = input<unknown>(null);
  dropListConnectedTo = input<(string | CdkDropList<unknown>)[]>([]);
  dropListEnterPredicate = input<
    ((drag: CdkDrag<unknown>, drop: CdkDropList<unknown>) => boolean) | undefined
  >(undefined);
  dropListDisabled = input(false);

  dropListDropped = output<CdkDragDrop<unknown>>();
  dropListEntered = output<CdkDragEnter<unknown>>();
  defaultEnterPredicate = (_drag: CdkDrag<unknown>, _drop: CdkDropList<unknown>) => true;

  // Agregar input para el estado de contagio completo
  contagionState = input<{
    card: Card;
    assignments: any[];
    temporaryViruses: {
      organId: string;
      playerId: string;
      virus: Card;
      isTemporary: true;
    }[];
  } | null>(null);

  private readonly organIcons: Record<CardColor, string> = {
    [CardColor.Red]: 'organ-red', // ❤️
    [CardColor.Green]: 'organ-green', // 🫃
    [CardColor.Blue]: 'organ-blue', // 🧠
    [CardColor.Yellow]: 'organ-yellow', // 🦴
    [CardColor.Multi]: 'organ-multi', // 🌈
    [CardColor.Halloween]: 'organ-halloween', // 🎃
    [CardColor.Orange]: 'organ-orange',
    [CardColor.Treatment]: '',
  };

  // Método para obtener todos los virus (reales + temporales)
  getAllAttachedCards(): Card[] {
    const organ = this.organ();
    const realCards = organ.attached || [];
    const tempCards = this.temporaryViruses() || [];

    return [...realCards, ...tempCards];
  }

  isVirus(attached: Card) {
    return attached.kind === CardKind.Virus;
  }

  isTemporaryVirus(virusId: string): boolean {
    return this.temporaryViruses().some((tv) => tv.id === virusId);
  }

  organIcon(): string {
    return this.organIcons[this.organ().color] ?? '❔';
  }

  getMedicineIcon(): string {
    return 'modifier-medicine';
  }

  getVirusIcon(): string {
    return 'modifier-virus';
  }

  private dragDropService = inject(DragDropService);

  onVirusDragStarted(virus: Card, fromOrganId: string) {
    this.dragDropService.draggedItem.set({ 
      fromOrganId, 
      virusId: virus.id, 
      virus, // Incluimos el objeto card para chequear color
      kind: 'virus-token' // diferenciador
    });
  }

  onVirusDragEnded() {
    this.dragDropService.draggedItem.set(null);
  }

  isValidTarget = computed(() => {
    const dragged = this.dragDropService.draggedItem();
    if (!dragged) return false;

    const organ = this.organ();
    
    // 1. Carta desde la mano
    if ('kind' in dragged && dragged.kind !== 'virus-token') {
      const card = dragged as Card;

      if (card.kind === CardKind.Medicine || card.kind === CardKind.Virus) {
        if (card.color === CardColor.Multi || organ.color === CardColor.Multi) return true;
        return card.color === organ.color;
      }

      if (card.kind === CardKind.Organ && card.color === CardColor.Orange) {
        // Órgano Mutante: debe animar todos los órganos del propio jugador
        return this.isMe();
      }

      if (card.kind === CardKind.Treatment) {
        switch (card.subtype) {
          case TreatmentSubtype.OrganThief:
            // "debe animar los órganos de todos los jugadores (menos los órganos inmunes u órganos que ya tenga el propio jugador)"
            // Si ya lo tiene, no se puede robar (lógica de gameStore). Aquí simplificamos:
            // !isMe() && !isImmune
            // TODO: verificar si el jugador YA tiene ese color (requiere access a mi board)
            // Por simplicidad visual: todos los rivales no inmunes.
            return !this.isMe() && !isImmune(organ);

          case TreatmentSubtype.Transplant:
            // "debe animar todos los órganos de todos los tableros (sin tener en cuenta lor órganos inmunes)"
            return !isImmune(organ);

          case TreatmentSubtype.AlienTransplant:
            // "debe animar todos los órganos de todos los tableros"
            return true;

          case TreatmentSubtype.failedExperiment:
            // "debe animar los órganos infectados o vacunados (no inmunes)"
            return (isInfected(organ) || isVaccinated(organ)) && !isImmune(organ);

          case TreatmentSubtype.colorThiefRed:
          case TreatmentSubtype.colorThiefGreen:
          case TreatmentSubtype.colorThiefBlue:
          case TreatmentSubtype.colorThiefYellow:
            // "solo debe animar los órganos correspondientes"
            if (this.isMe()) return false;
            
            // Map subtype to color
            let targetColor: CardColor | null = null;
            if (card.subtype === TreatmentSubtype.colorThiefRed) targetColor = CardColor.Red;
            if (card.subtype === TreatmentSubtype.colorThiefGreen) targetColor = CardColor.Green;
            if (card.subtype === TreatmentSubtype.colorThiefBlue) targetColor = CardColor.Blue;
            if (card.subtype === TreatmentSubtype.colorThiefYellow) targetColor = CardColor.Yellow;

            if (!targetColor) return false;
            
            // Si es multicolor o coincide exacto
            // "por ejemplo si es ColorThiefRed, solo los órganos rojos".
            // Asumimos que Multicolor NO cuenta para ColorThief específico salvo que las reglas digan lo contrario.
            // Dado el prompt "solo los órganos rojos", seremos estrictos con el color base.
            return organ.color === targetColor;

          default:
            return false;
        }
      }
      
      return false; 
    }

    // 2. Virus desde otro órgano (Contagio)
    if ('virus' in dragged) {
      const virus = dragged.virus as Card;
      if (virus.color === CardColor.Multi || organ.color === CardColor.Multi) return true;
      return virus.color === organ.color;
    }

    return false;
  });


  // Drag over state for visual feedback
  isDragOver = computed(() => {
    // Si no es válido, no puede estar dragOver (protección extra)
    if (!this.isValidTarget()) return false;
    return this._isDragOver();
  });
  private _isDragOver = signal(false);

  constructor() {
    // Resetear el estado visual si se cancela el drag globalmente
    effect(() => {
      if (!this.dragDropService.draggedItem()) {
        this._isDragOver.set(false);
      }
    });
  }

  onDragEntered() {
    if (this.isValidTarget()) {
      this._isDragOver.set(true);
    }
  }

  onDragExited() {
    this._isDragOver.set(false);
  }

  onDropped() {
    this._isDragOver.set(false);
  }
}

import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  Input,
} from '@angular/core';
import { PlayerCard } from './player-card/player-card';
import { TitleCasePipe } from '@angular/common';
import {
  Card,
  CardColor,
  CardKind,
} from '../../../../../core/models/card.model';
import { PublicPlayerInfo } from '../../../../../core/models/game.model';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { GameStoreService } from '../../../../../core/services/game-store.service';
import { DragDropService } from '../../../../../core/services/drag-drop.service';
import { ApiPlayerService } from '../../../../../core/services/api/api.player.service';

@Component({
  selector: 'app-player-board',
  standalone: true,
  imports: [PlayerCard, TitleCasePipe, DragDropModule],
  templateUrl: './player-board.html',
  styleUrl: './player-board.css',
})
export class PlayerBoard implements AfterViewInit {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  private _dragDrop = inject(DragDropService);
  get apiPlayer() {
    return this._apiPlayer;
  }
  get gameStore() {
    return this._gameStore;
  }
  get dragDrop() {
    return this._dragDrop;
  }

  player = input.required<PublicPlayerInfo>();
  isMe = input(false);
  isActive = input(false);
  roomId = input.required<string>();

  cardColors = Object.values(CardColor);

  // ids de listas de drop con las que este tablero puede conectarse
  connectedTo = computed(() => {
    const me = this._apiPlayer.player();
    if (!me) return [];
    const handId = this._dragDrop.handListId(me.id);
    return handId ? [handId] : [];
  });

  ngAfterViewInit(): void {
    // Registrar id único y estable para este tablero
    const pid = this.player().player.id;
    const boardId = `boardList-${pid}`;
    this._dragDrop.setBoardListId(pid, boardId);
  }

  onEnterBoard(event: any) {
    console.log(`[ENTER] Carta ${event.item.data} entró en tablero`);
  }

  getOrganByColor(color: CardColor) {
    return this.player().board.find((o) => o.color === color);
  }

  onCardDropped(event: CdkDragDrop<any>) {
    const card: Card = event.item.data;

    // Solo aceptamos órganos o medicinas en nuestro propio tablero
    if (!this.isMe()) return;
    if (card.kind !== CardKind.Organ && card.kind !== CardKind.Medicine) return;

    const rid = this.roomId();
    if (!rid) return;

    // si es órgano → como hasta ahora
    if (card.kind === CardKind.Organ) {
      this._gameStore.playCard(rid, card.id, {
        organId: '', // se coloca en un hueco vacío
        playerId: this.player().player.id,
      });
    }

    // si es medicina → necesita un órgano destino
    if (card.kind === CardKind.Medicine) {
      // buscamos un órgano del mismo color
      const targetOrgan = this.player().board.find(
        (o) => o.color === card.color
      );
      if (!targetOrgan) {
        console.warn('No hay órgano válido para esta medicina');
        return;
      }

      this._gameStore.playCard(rid, card.id, {
        organId: targetOrgan.id,
        playerId: this.player().player.id,
      });
    }
  }
  // onCardDropped(event: CdkDragDrop<any>) {
  //   console.log(`card droped: ${event}`);
  //   const card: Card = event.item.data;

  //   // Solo aceptamos órganos y en nuestro propio tablero
  //   if (!this.isMe() || card.kind !== CardKind.Organ) return;

  //   const rid = this.roomId();
  //   if (!rid) return;

  //   this._gameStore.playCard(rid, card.id, {
  //     organId: '', // no hace falta target porque cae en tu propio tablero
  //     playerId: this.player().player.id,
  //   });
  // }
}

import {
  Component,
  inject,
  OnChanges,
  SimpleChanges,
  input,
  computed,
} from '@angular/core';
import { Card } from '../../../../core/models/card.model';
import { PublicGameState, PlayCardTarget } from '../../../../core/models/game.model';
import { ApiPlayerService } from '../../../../core/services/api/api.player.service';
import { GameStoreService } from '../../../../core/services/game-store.service';
import { TargetSelectComponent } from './target-select/target-select.component';
import { HandActionService } from './services/hand-action.service';
import { HandDiscardService } from './services/hand-discard.service';
import { ApparitionBannerComponent } from './components/apparition-banner/apparition-banner.component';
import { HandListComponent } from './components/hand-list/hand-list.component';
import { DiscardActionButtonComponent } from './components/discard-action-button/discard-action-button.component';
import { HandStateService } from './services/hand-state.service';
import { HandStrategyResolverService } from './services/hand-strategy-resolver.service';
import { HandUIHelperService } from './services/hand-ui-helper.service';

@Component({
  selector: 'game-hand',
  standalone: true,
  imports: [TargetSelectComponent, ApparitionBannerComponent, HandListComponent, DiscardActionButtonComponent],
  templateUrl: './game-hand.html',
  styleUrl: './game-hand.css',
  providers: [HandActionService, HandStateService, HandDiscardService, HandStrategyResolverService, HandUIHelperService],
  host: { '[class.is-my-turn]': 'isMyTurn()' }
})
export class GameHandComponent implements OnChanges {
  private _apiPlayer = inject(ApiPlayerService);
  private _gameStore = inject(GameStoreService);
  handAction = inject(HandActionService);
  handUIHelper = inject(HandUIHelperService);
  handDiscard = inject(HandDiscardService);
  apiPlayer = this._apiPlayer;
  hand = input<Card[]>([]);
  isMyTurn = input(false);
  roomId = input<string | null>(null);
  publicState = input<PublicGameState | null>(null);
  gameEnded = input(false);

  readonly mustPlayCardId = computed(() => {
    const st = this.publicState();
    const me = this._apiPlayer.player();
    if (!st || !me || !st.pendingAction) return null;
    if (
      st.pendingAction.type === 'ApparitionDecision' &&
      st.pendingAction.playerId === me.id
    ) {
      return st.pendingAction.cardId;
    }
    return null;
  });

  boardIds(): string[] {
    const publicState = this.publicState();
    if (!publicState) return [];
    const ids: string[] = [];
    for (const p of publicState.players) {
      ids.push(`board-${p.player.id}`);
      for (const organ of p.board) {
        ids.push(`slot-${p.player.id}-${organ.color}`);
      }
    }
    return ids;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const turnChange = changes['isMyTurn'];
    if (!turnChange || turnChange.firstChange) return;

    if (!turnChange.previousValue && turnChange.currentValue) {
      this.handAction.clearSelection();
    }

    if (turnChange.previousValue && !turnChange.currentValue) {
      this.handAction.clearSelection();
      this.handDiscard.reset();
    }
  }

  selectCardToPlay(card: Card) {
    this.handAction.selectCard(card, this.publicState());
  }

  selectCardAndTarget(card: Card, target: PlayCardTarget) {
    this.handAction.selectCard(card, this.publicState());
    this.handUIHelper.setTarget(target);
    this.handUIHelper.setDragDropSelection(true);
  }
  
  keepApparitionCard() {
    if (!this.mustPlayCardId()) return;
    const st = this.publicState();
    if (st) this._gameStore.endTurn(st.roomId);
  }
}

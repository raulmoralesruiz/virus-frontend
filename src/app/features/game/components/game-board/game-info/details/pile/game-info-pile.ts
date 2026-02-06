import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'game-info-pile',
  standalone: true,
  imports: [NgClass],
  templateUrl: './game-info-pile.html',
  styleUrl: './game-info-pile.css',
})
export class GameInfoPileComponent {
  label = input('');
  value = input<string | number | null>('');
  ariaLabel = input('');
  modifierClass = input<string | string[] | null | undefined>(undefined);
  iconClass = input<string | string[] | null | undefined>(undefined);
  role = input('group');
}

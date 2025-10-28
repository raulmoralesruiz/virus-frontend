import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'game-info-pile',
  standalone: true,
  imports: [NgClass],
  templateUrl: './game-info-pile.html',
  styleUrl: './game-info-pile.css',
})
export class GameInfoPileComponent {
  @Input() label = '';
  @Input() value: string | number | null = '';
  @Input() ariaLabel = '';
  @Input() modifierClass?: string | string[] | null;
  @Input() iconClass?: string | string[] | null;
  @Input() role = 'group';
}

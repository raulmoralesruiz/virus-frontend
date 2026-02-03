import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayCardTarget } from '../../../../../../../core/models/game.model';
import { TargetSelectOption, PlayerOption } from '../../target-select.models';

@Component({
  selector: 'game-target-select-transplant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './target-select-transplant.component.html',
  styleUrls: ['./target-select-transplant.component.css']
})
export class TargetSelectTransplantComponent {
  playerOptions = input.required<PlayerOption[]>();
  targetOptions = input.required<TargetSelectOption[]>();
  
  transplantPlayerA = input<string>('');
  transplantSelectionA = input<string>('');
  transplantPlayerB = input<string>('');
  transplantSelectionB = input<string>('');

  targetChange = output<{ value: string; which: 'A' | 'B' }>();
  playerChange = output<{ playerId: string; which: 'A' | 'B' }>();

  handlePlayerChange(playerId: string, which: 'A' | 'B') {
    this.playerChange.emit({ playerId, which });
  }

  selectOrgan(option: TargetSelectOption, which: 'A' | 'B') {
    if (!option.organId) return;
    this.targetChange.emit({ value: this.toOptionValue(option), which });
  }

  organsForPlayer(playerId: string): TargetSelectOption[] {
    if (!playerId) return [];
    return this.targetOptions().filter(
      (option) => option.playerId === playerId && !!option.organId
    );
  }

  toOptionValue(target?: PlayCardTarget | TargetSelectOption | null): string {
    if (!target) return '';
    return `${target.organId}|${target.playerId}`;
  }

  organColorClass(color?: string): string {
    switch (color) {
      case 'red': return 'color-dot--red';
      case 'green': return 'color-dot--green';
      case 'blue': return 'color-dot--blue';
      case 'yellow': return 'color-dot--yellow';
      case 'multi': return 'color-dot--multi';
      default: return 'color-dot--neutral';
    }
  }

  organColorLabel(color?: string): string {
    // Basic mapping, could be input or shared service if complex
    const labels: Record<string, string> = {
        red: 'Corazón',
        green: 'Estómago',
        blue: 'Cerebro',
        yellow: 'Hueso',
        multi: 'Multicolor',
        orange: 'Mutante',
    };
    if (!color) return 'Sin órgano';
    return labels[color] ?? color;
  }
}

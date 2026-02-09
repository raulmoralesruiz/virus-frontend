import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayCardTarget } from '@core/models/game.model';
import { CardIconComponent } from '@shared/components/card-icon/card-icon.component';
import { TargetSelectOption, PlayerOption } from '../../target-select.models';

@Component({
  selector: 'game-target-select-standard',
  standalone: true,
  imports: [CommonModule, FormsModule, CardIconComponent],
  templateUrl: './target-select-standard.component.html',
  styleUrls: ['./target-select-standard.component.css']
})
export class TargetSelectStandardComponent {
  playerOptions = input.required<PlayerOption[]>();
  targetOptions = input.required<TargetSelectOption[]>();
  
  singlePlayerSelection = input<string>('');
  singleSelectionValue = input<string>('');
  isSelfTarget = input<boolean>(false);
  isFailedExperiment = input<boolean>(false);
  isDragDrop = input<boolean>(false);
  selectedAction = input<'medicine' | 'virus' | null>(null);

  targetChange = output<string>();
  playerChange = output<string>();
  actionChange = output<'medicine' | 'virus'>();

  handlePlayerChange(playerId: string) {
    this.playerChange.emit(playerId);
  }

  selectOrgan(option: TargetSelectOption) {
    if (!option.organId) return;
    this.targetChange.emit(this.toOptionValue(option));
  }

  toOptionValue(target?: PlayCardTarget | TargetSelectOption | null): string {
    if (!target) return '';
    return `${target.organId}|${target.playerId}`;
  }

  organsForPlayer(playerId: string): TargetSelectOption[] {
    if (!playerId) return [];
    return this.targetOptions().filter(
      (option) => option.playerId === playerId && !!option.organId
    );
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

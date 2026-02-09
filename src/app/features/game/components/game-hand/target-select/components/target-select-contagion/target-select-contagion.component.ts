import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicGameState } from '@core/models/game.model';
import { TargetSelectOption, PlayerOption } from '../../target-select.models';
import { organColorClass, organColorLabel, toOptionValue } from '../../target-select.utils';
import { getContagionPlayerOptions, getContagionOrgansForPlayer, getContagionSourceLabel, getContagionVirusLabel } from './target-select-contagion.utils';

@Component({
  selector: 'game-target-select-contagion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './target-select-contagion.component.html',
  styleUrls: ['./target-select-contagion.component.css']
})
export class TargetSelectContagionComponent {
  contagionAssignments = input.required<{
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }[]>();
  publicState = input<PublicGameState | null>(null);

  contagionTargetChange = output<{ value: string; index: number }>();

  handleContagionPlayerChange(playerId: string, index: number) {
    const value = playerId ? `|${playerId}` : '';
    this.contagionTargetChange.emit({ value, index });
  }

  selectContagionOrgan(option: TargetSelectOption, index: number) {
    if (!option.organId || !option.playerId) return;
    this.contagionTargetChange.emit({ value: toOptionValue(option), index });
  }

  toOptionValue(option: TargetSelectOption): string {
    return toOptionValue(option);
  }

  get contagionPlayerOptions(): PlayerOption[] {
    return getContagionPlayerOptions(this.publicState(), this.contagionAssignments());
  }

  contagionSourceLabel(assignment: { fromOrganId: string, toOrganId: string, toPlayerId: string }): string {
    return getContagionSourceLabel(this.publicState(), assignment);
  }

  contagionVirusLabel(assignment: { fromOrganId: string, toOrganId: string, toPlayerId: string }): string {
    return getContagionVirusLabel(this.publicState(), assignment);
  }

  contagionOrgansForPlayer(playerId: string): TargetSelectOption[] {
    return getContagionOrgansForPlayer(this.publicState(), playerId);
  }

  organColorClass(color?: string): string {
    return organColorClass(color);
  }

  organColorLabel(color?: string): string {
    return organColorLabel(color);
  }

  contagionSelectionValue(assignment: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }): string {
    if (!assignment.toOrganId || !assignment.toPlayerId) return '';
    return `${assignment.toOrganId}|${assignment.toPlayerId}`;
  }
}

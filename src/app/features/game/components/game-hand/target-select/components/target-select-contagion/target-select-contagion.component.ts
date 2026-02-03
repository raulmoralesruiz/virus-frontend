import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicGameState, OrganOnBoard } from '../../../../../../../core/models/game.model';
import { TargetSelectOption, PlayerOption } from '../../target-select.models';

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
    this.contagionTargetChange.emit({ value: this.toOptionValue(option), index });
  }

  toOptionValue(option: TargetSelectOption): string {
    return `${option.organId}|${option.playerId}`;
  }

  get contagionPlayerOptions(): PlayerOption[] {
    const state = this.publicState();
    if (!state) return [];
    
    // Logic from original component
    const selectedPlayers = new Set(
      this.contagionAssignments()
        .map((assignment) => assignment.toPlayerId)
        .filter((id): id is string => Boolean(id))
    );
    const players: PlayerOption[] = [];
    for (const info of state.players) {
      const hasFreeOrgan = info.board.some((organ: OrganOnBoard) => !organ.attached.length);
      if (hasFreeOrgan || selectedPlayers.has(info.player.id)) {
        players.push({ id: info.player.id, name: info.player.name });
      }
    }
    return players;
  }

  contagionOrgansForPlayer(playerId: string): TargetSelectOption[] {
    const state = this.publicState();
    if (!playerId || !state) return [];
    const info = state.players.find((p: any) => p.player.id === playerId);
    if (!info) return [];
    return info.board
      .filter((organ: OrganOnBoard) => !organ.attached.length)
      .map((organ: OrganOnBoard) => ({
        playerId: info.player.id,
        playerName: info.player.name,
        organId: organ.id,
        organColor: organ.color,
      }));
  }

  contagionSelectionValue(assignment: {
    fromOrganId: string;
    toOrganId: string;
    toPlayerId: string;
  }): string {
    if (!assignment.toOrganId || !assignment.toPlayerId) return '';
    return `${assignment.toOrganId}|${assignment.toPlayerId}`;
  }

  contagionSourceLabel(assignment: { fromOrganId: string }): string {
    const organInfo = this.findOrganById(assignment.fromOrganId);
    if (organInfo) {
      return `Desde ${this.organColorLabel(organInfo.organ.color)}`;
    }
    return `Desde órgano ${assignment.fromOrganId}`;
  }

  private findOrganById(organId: string): { organ: OrganOnBoard; playerName: string } | null {
    const state = this.publicState();
    if (!state) return null;
    for (const info of state.players) {
      const organ = info.board.find((o: OrganOnBoard) => o.id === organId);
      if (organ) {
        return { organ, playerName: info.player.name };
      }
    }
    return null;
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
    // Basic mapping, duplicated for simplicity as per plan
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

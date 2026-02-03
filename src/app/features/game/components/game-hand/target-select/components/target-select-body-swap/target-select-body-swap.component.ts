import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'game-target-select-body-swap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './target-select-body-swap.component.html',
  styleUrls: ['./target-select-body-swap.component.css']
})
export class TargetSelectBodySwapComponent {
  selectedDirection = input<'clockwise' | 'counter-clockwise' | null>(null);
  directionChange = output<'clockwise' | 'counter-clockwise' | null>();
}

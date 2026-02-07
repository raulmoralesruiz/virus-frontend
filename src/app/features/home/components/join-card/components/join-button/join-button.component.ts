import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'home-join-button',
  standalone: true,
  templateUrl: './join-button.component.html',
  styleUrl: './join-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinButtonComponent {
  action = output<void>();
}

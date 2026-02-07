import { Component, ChangeDetectionStrategy, model, output } from '@angular/core';

@Component({
  selector: 'home-join-input',
  standalone: true,
  imports: [],
  templateUrl: './join-input.component.html',
  styleUrl: './join-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinInputComponent {
  value = model<string>('');
  enter = output<void>();
}

import { Component, output } from '@angular/core';

import { JoinInputComponent } from './components/join-input/join-input.component';
import { JoinButtonComponent } from './components/join-button/join-button.component';

@Component({
  selector: 'home-join-card',
  standalone: true,
  imports: [JoinInputComponent, JoinButtonComponent],
  templateUrl: './join-card.component.html',
  styleUrl: './join-card.component.css'
})
export class JoinCardComponent {
  join = output<string>();
  name = '';

  onJoin(name: string) {
    if (name) {
      this.join.emit(name);
    }
  }
}

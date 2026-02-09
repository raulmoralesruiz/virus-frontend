import { Component, input } from '@angular/core';

@Component({
  selector: 'game-action-identity',
  standalone: true,
  templateUrl: './game-action-identity.component.html',
  styleUrl: './game-action-identity.component.css',
})
export class GameActionIdentityComponent {
  actor = input<string | undefined>();
}

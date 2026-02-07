import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'home-greeting',
  standalone: true,
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GreetingComponent {

}

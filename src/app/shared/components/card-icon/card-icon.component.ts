import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'card-icon',
  standalone: true,
  template: `
    <svg class="icon" aria-hidden="true">
      <use [attr.href]="href()"></use>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--icon-size, 1em);
      height: var(--icon-size, 1em);
    }
    .icon {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `]
})
export class CardIconComponent {
  name = input.required<string>();
  
  href = computed(() => `#icon-${this.name()}`);
}

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'home-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent {}

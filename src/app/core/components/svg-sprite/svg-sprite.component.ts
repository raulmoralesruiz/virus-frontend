import { Component } from '@angular/core';
import { SvgOrgansComponent } from './svg-organs.component';
import { SvgTreatmentsComponent } from './svg-treatments.component';
import { SvgModifiersComponent } from './svg-modifiers.component';
import { SvgUiComponent } from './svg-ui.component';

@Component({
  selector: 'svg-sprite',
  standalone: true,
  templateUrl: './svg-sprite.component.html',
  imports: [
    SvgOrgansComponent,
    SvgTreatmentsComponent,
    SvgModifiersComponent,
    SvgUiComponent,
  ],
})
export class SvgSpriteComponent {}

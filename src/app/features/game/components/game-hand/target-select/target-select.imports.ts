import { CommonModule } from '@angular/common';
import { TargetSelectTransplantComponent } from './components/target-select-transplant/target-select-transplant.component';
import { TargetSelectContagionComponent } from './components/target-select-contagion/target-select-contagion.component';
import { TargetSelectBodySwapComponent } from './components/target-select-body-swap/target-select-body-swap.component';
import { TargetSelectPlayerComponent } from './components/target-select-player/target-select-player.component';
import { TargetSelectStandardComponent } from './components/target-select-standard/target-select-standard.component';

export const TARGET_SELECT_IMPORTS = [
    CommonModule, 
    TargetSelectTransplantComponent,
    TargetSelectContagionComponent,
    TargetSelectBodySwapComponent,
    TargetSelectPlayerComponent,
    TargetSelectStandardComponent
];

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { BobyToolTipComponent } from './tooltip.component';
import { BobyToolTipDirective } from '../../directives/tooltip/tooltip.directive';

@NgModule({
    declarations: [
        BobyToolTipComponent,
        BobyToolTipDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [BobyToolTipDirective]
})
export class TooltipModule {
}

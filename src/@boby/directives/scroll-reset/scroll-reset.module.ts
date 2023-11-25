import { NgModule } from '@angular/core';
import { BobyScrollResetDirective } from '@boby/directives/scroll-reset/scroll-reset.directive';

@NgModule({
    declarations: [
        BobyScrollResetDirective
    ],
    exports     : [
        BobyScrollResetDirective
    ]
})
export class BobyScrollResetModule
{
}

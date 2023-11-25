import { NgModule } from '@angular/core';
import { BobyScrollbarDirective } from '@boby/directives/scrollbar/scrollbar.directive';

@NgModule({
    declarations: [
        BobyScrollbarDirective
    ],
    exports     : [
        BobyScrollbarDirective
    ]
})
export class BobyScrollbarModule
{
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BobyCardComponent } from '@boby/components/card/card.component';

@NgModule({
    declarations: [
        BobyCardComponent
    ],
    imports     : [
        CommonModule
    ],
    exports     : [
        BobyCardComponent
    ]
})
export class BobyCardModule
{
}

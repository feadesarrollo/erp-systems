import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BobyHighlightComponent } from '@boby/components/highlight/highlight.component';

@NgModule({
    declarations: [
        BobyHighlightComponent
    ],
    imports     : [
        CommonModule
    ],
    exports     : [
        BobyHighlightComponent
    ]
})
export class BobyHighlightModule
{
}

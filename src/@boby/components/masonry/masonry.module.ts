import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BobyMasonryComponent } from '@boby/components/masonry/masonry.component';

@NgModule({
    declarations: [
        BobyMasonryComponent
    ],
    imports     : [
        CommonModule
    ],
    exports     : [
        BobyMasonryComponent
    ]
})
export class BobyMasonryModule
{
}

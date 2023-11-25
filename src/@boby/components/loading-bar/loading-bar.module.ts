import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BobyLoadingBarComponent } from '@boby/components/loading-bar/loading-bar.component';

@NgModule({
    declarations: [
        BobyLoadingBarComponent
    ],
    imports     : [
        CommonModule,
        MatProgressBarModule
    ],
    exports     : [
        BobyLoadingBarComponent
    ]
})
export class BobyLoadingBarModule
{
}

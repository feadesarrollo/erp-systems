import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BobyFullscreenComponent } from '@boby/components/fullscreen/fullscreen.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        BobyFullscreenComponent
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        CommonModule
    ],
    exports     : [
        BobyFullscreenComponent
    ]
})
export class BobyFullscreenModule
{
}

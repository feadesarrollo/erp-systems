import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BobyDrawerComponent } from '@boby/components/drawer/drawer.component';

@NgModule({
    declarations: [
        BobyDrawerComponent
    ],
    imports     : [
        CommonModule
    ],
    exports     : [
        BobyDrawerComponent
    ]
})
export class BobyDrawerModule
{
}

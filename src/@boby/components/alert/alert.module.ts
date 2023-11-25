import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BobyAlertComponent } from '@boby/components/alert/alert.component';

@NgModule({
    declarations: [
        BobyAlertComponent
    ],
    imports     : [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    exports     : [
        BobyAlertComponent
    ]
})
export class BobyAlertModule
{
}

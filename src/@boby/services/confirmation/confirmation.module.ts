import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BobyConfirmationService } from '@boby/services/confirmation/confirmation.service';
import { BobyConfirmationDialogComponent } from '@boby/services/confirmation/dialog/dialog.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        BobyConfirmationDialogComponent
    ],
    imports     : [
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        CommonModule
    ],
    providers   : [
        BobyConfirmationService
    ]
})
export class BobyConfirmationModule
{
    /**
     * Constructor
     */
    constructor(private _bobyConfirmationService: BobyConfirmationService)
    {
    }
}

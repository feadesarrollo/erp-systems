import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BobyConfirmationConfig } from '@boby/services/confirmation/confirmation.types';

@Component({
    selector     : 'boby-confirmation-dialog',
    templateUrl  : './dialog.component.html',
    styles       : [
        /* language=SCSS */
        `
            .boby-confirmation-dialog-panel {
                @screen md {
                    @apply w-128;
                }

                .mat-dialog-container {
                    padding: 0 !important;
                }
            }
        `
    ],
    encapsulation: ViewEncapsulation.None
})
export class BobyConfirmationDialogComponent implements OnInit
{
    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: BobyConfirmationConfig,
        public matDialogRef: MatDialogRef<BobyConfirmationDialogComponent>
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

}

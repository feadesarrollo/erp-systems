import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'erp-claim-container-dialog',
    templateUrl: './claim-container-dialog.component.html',
    styleUrls: ['./claim-container-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimContainerDialogComponent implements OnInit {

    public containerTitle: string = '';
    public claim: object;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public matDialogRef: MatDialogRef<ClaimContainerDialogComponent>
    ) { }

    ngOnInit(): void {
        this.containerTitle = this._data.momento;
        this.claim = this._data.claim;
    }

    /**
     * Close dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

}

import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ClaimsService } from '../../claims.service';
import { takeUntil } from 'rxjs/operators';
import {Subject} from "rxjs";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";

@Component({
  selector: 'erp-previous-dialog',
  templateUrl: './previous-dialog.component.html',
  styleUrls: ['./previous-dialog.component.scss']
})
export class PreviousDialogComponent implements OnInit {

    public PreviousForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private endpoint: string;
    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _fcService: BobyConfirmationService,
                private _reclamoS: ClaimsService,
                public matDialogRef: MatDialogRef<PreviousDialogComponent>) { }

    ngOnInit(): void {

        this.endpoint = this._data.endpoint;

        this.PreviousForm = this._formBuilder.group({
              obs: ['']
        });
    }

    /**
     * Close dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    /**
     * Change estado wizard
     */
    onChangePrevious()
    {
        this._reclamoS.onChangePrevious(this.PreviousForm.getRawValue(), this._data.process, this.endpoint)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.matDialogRef.close(response);
            });

    }

}

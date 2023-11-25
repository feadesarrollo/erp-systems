import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';

import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";
import {HumanTalentService} from "../../../../human-talent.service";

@Component({
    selector: 'erp-test-type-dialog',
    templateUrl: './test-type-dialog.component.html',
    styleUrls: ['./test-type-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestTypeDialogComponent implements OnInit {


    public dataSource: MatTableDataSource<any>;
    public TestTypeForm: FormGroup;
    configForm: FormGroup;

    status: string = '';
    showMessage : string;
    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<TestTypeDialogComponent>,
                private _htService: HumanTalentService,
                private _fcService: BobyConfirmationService) { }

    ngOnInit(): void {

        this.TestTypeForm = this._formBuilder.group({
            id_tipo_prueba: [''],
            nombre: ['',[Validators.required]],
            tipo: ['',[Validators.required]],
            procedimiento: ['',[Validators.required]]
        });

        this.showMessage = this._data.status == 'new' ? 'crear' : 'modificar';
        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de ${this.showMessage} el registro.`,
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        if ( this._data.status == 'edit' ) {
            this.TestTypeForm.patchValue(this._data.testType);
        }
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    saveTestType() {

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if ( result == 'confirmed' ){

                if (this._data.status == 'edit'){
                    const testType = this.TestTypeForm.value;
                    Object.keys(this.TestTypeForm.value).forEach(key => {
                        if(!testType[key]){
                            testType[key] = '';
                        }
                    });
                }

                this._htService.postTestType(this.TestTypeForm.value).subscribe(
                    (resp) => {
                        if ( !resp.error) {
                            this.matDialogRef.close(this.TestTypeForm.value);
                        }

                    }
                );
            }/*else{
                this.matDialogRef.close(this.TestTypeForm.value);
            }*/
        });



    }

}

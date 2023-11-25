import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { ClassifiersService } from '../classifiers.service';
import {BobyConfirmationService} from "@boby/services/confirmation";
import {BobyMockApiUtils} from "@boby/lib/mock-api";

@Component({
  selector: 'erp-classifiers-dialog',
  templateUrl: './classifiers-dialog.component.html',
  styleUrls: ['./classifiers-dialog.component.scss']
})
export class ClassifiersDialogComponent implements OnInit {

    submitted: boolean = false;
    loading: boolean;
    public dataSource: MatTableDataSource<any>;

    public parameterForm: FormGroup;
    configForm: FormGroup;
    showMessage : string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<ClassifiersDialogComponent>,
        private _classifierService: ClassifiersService,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {
        this.parameterForm = this._formBuilder.group({
            id: [''],
            icon: ['',[Validators.required]],
            title: ['',[Validators.required]],
            code: [''],
            description: ['',[Validators.required]]
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
            this.parameterForm.patchValue(this._data.motivo);
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

    saveParameter() {

        this.submitted = true;
        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if (result == 'confirmed') {

                if (this._data.status == 'edit') {
                    const parameter = this.parameterForm.value;
                    Object.keys(this.parameterForm.value).forEach(key => {
                        if (!parameter[key]) {
                            parameter[key] = '';
                        }
                    });
                }

                let codes = [];
                this.parameterForm.get('title').value.split(' ').forEach( (value) => {
                    codes.push(value[0]);
                });
                this.parameterForm.get('id').setValue( BobyMockApiUtils.guid() );
                this.parameterForm.get('code').setValue( codes.join('').toLowerCase() );

                this._classifierService.postParameter(this.parameterForm.value).subscribe(
                    (resp: any) => {
                        this.matDialogRef.close(resp);
                    }
                );

            }else{
                this.matDialogRef.close(this.parameterForm.value);
            }
        });

    }

}

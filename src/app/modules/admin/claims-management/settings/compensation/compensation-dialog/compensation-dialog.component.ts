import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BobyConfirmationService } from "@boby/services/confirmation/confirmation.service";
import { SettingsService } from "../../settings.service";
import { MatTableDataSource } from "@angular/material/table";
import { Compensation } from "../../settings.type";


@Component({
    selector: 'erp-compensation-dialog',
    templateUrl: './compensation-dialog.component.html',
    styleUrls: ['./compensation-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompensationDialogComponent implements OnInit {

    compensacion: Compensation = {};

    submitted: boolean = false;
    loading: boolean;
    public dataSource: MatTableDataSource<any>;

    public CompensacionForm: FormGroup;
    configForm: FormGroup;
    showMessage : string;

    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<CompensationDialogComponent>,
                private _settingS: SettingsService,
                private _fcService: BobyConfirmationService) { }

    ngOnInit(): void {

        this.CompensacionForm = this._formBuilder.group({
            id_compensacion: [''],
            codigo: ['',[Validators.required]],
            nombre: ['',[Validators.required]],
            orden: ['',[Validators.required]]
        });

        this.showMessage = this._data.momento == 'nuevo' ? 'crear' : 'modificar';
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

        if ( this._data.momento == 'editar' ) {
            this.CompensacionForm.patchValue(this._data.compensacion);
            this.compensacion = { ...this._data.compensacion };
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

    saveCompensacion() {

        this.submitted = true;
        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if (result == 'confirmed') {

                if (this._data.momento == 'editar') {
                    const compensacionReclamo = this.CompensacionForm.value;
                    Object.keys(this.CompensacionForm.value).forEach(key => {
                        if (!compensacionReclamo[key]) {
                            compensacionReclamo[key] = '';
                        }
                    });
                }

                this._settingS.postCompensacion(this.CompensacionForm.value).subscribe(
                    (resp) => {
                        if (!resp.error) {
                            this.loading = true;
                            this.matDialogRef.close(this.CompensacionForm.value);
                        }
                    }
                );
            }else{
                this.matDialogRef.close(this.CompensacionForm.value);
            }
        });

    }
}

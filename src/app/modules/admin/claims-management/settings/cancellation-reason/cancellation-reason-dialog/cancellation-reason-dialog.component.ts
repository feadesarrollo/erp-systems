import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BobyConfirmationService } from "@boby/services/confirmation/confirmation.service";
import { SettingsService } from "../../settings.service";
import { MatTableDataSource } from "@angular/material/table";
import { CancellationReason } from '../../settings.type';

@Component({
  selector: 'erp-cancellation-reason-dialog',
  templateUrl: './cancellation-reason-dialog.component.html',
  styleUrls: ['./cancellation-reason-dialog.component.scss']
})
export class CancellationReasonDialogComponent implements OnInit {

    motivo: CancellationReason = {};

    submitted: boolean = false;
    loading: boolean;
    public dataSource: MatTableDataSource<any>;

    public CancellationForm: FormGroup;
    configForm: FormGroup;
    showMessage : string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<CancellationReasonDialogComponent>,
        private _settingS: SettingsService,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {
        this.CancellationForm = this._formBuilder.group({
            id_motivo_anulado: [''],
            motivo: ['',[Validators.required]],
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
            this.CancellationForm.patchValue(this._data.motivo);
            this.motivo = { ...this._data.motivo };
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

    saveMotivoAnulacion() {

        this.submitted = true;
        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if (result == 'confirmed') {

                if (this._data.momento == 'editar') {
                    const cancellationReason = this.CancellationForm.value;
                    Object.keys(this.CancellationForm.value).forEach(key => {
                        if (!cancellationReason[key]) {
                            cancellationReason[key] = '';
                        }
                    });
                }

                this._settingS.postMotivoAnulacion(this.CancellationForm.value).subscribe(
                    (resp) => {
                        if (!resp.error) {
                            this.loading = true;
                            this.matDialogRef.close(this.CancellationForm.value);
                        }
                    }
                );
            }else{
                this.matDialogRef.close(this.CancellationForm.value);
            }
        });

    }

}

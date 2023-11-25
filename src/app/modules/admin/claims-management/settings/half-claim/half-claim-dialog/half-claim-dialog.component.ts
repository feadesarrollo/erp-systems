import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BobyConfirmationService } from '@boby/services/confirmation/confirmation.service';
import { SettingsService } from "../../settings.service";
import { MatTableDataSource } from "@angular/material/table";
import { HalfClaim } from '../../settings.type';

@Component({
    selector: 'erp-half-claim-dialog',
    templateUrl: './half-claim-dialog.component.html',
    styleUrls: ['./half-claim-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HalfClaimDialogComponent implements OnInit {

    medio: HalfClaim = {};
    submitted: boolean = false;
    loading: boolean;
    public dataSource: MatTableDataSource<any>;
    public MedioReclamoForm: FormGroup;
    configForm: FormGroup;

    momento: string = '';
    showMessage : string;
    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<HalfClaimDialogComponent>,
                private _settingS: SettingsService,
                private _fcService: BobyConfirmationService) { }

    ngOnInit(): void {
        this.MedioReclamoForm = this._formBuilder.group({
            id_medio_reclamo: [''],
            codigo: ['',[Validators.required]],
            nombre_medio: ['',[Validators.required]],
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
            this.MedioReclamoForm.patchValue(this._data.medio);
            this.medio = { ...this._data.medio };
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

    saveMedio() {

        this.submitted = true;

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if ( result == 'confirmed' ){

                if (this._data.momento == 'editar'){
                    const medioReclamo = this.MedioReclamoForm.value;
                    Object.keys(this.MedioReclamoForm.value).forEach(key => {
                        if(!medioReclamo[key]){
                            medioReclamo[key] = '';
                        }
                    });
                }

                this._settingS.postMedioReclamo(this.MedioReclamoForm.value).subscribe(
                    (resp) => {
                        if ( !resp.error) {
                            this.loading = true;
                            this.matDialogRef.close(this.MedioReclamoForm.value);
                        }

                    }
                );
            }else{
                this.matDialogRef.close(this.MedioReclamoForm.value);
            }
        });



    }

}

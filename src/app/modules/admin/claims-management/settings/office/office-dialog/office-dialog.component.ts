import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Office } from "../../settings.type";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SettingsService} from "../../settings.service";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'erp-office-dialog',
  templateUrl: './office-dialog.component.html',
  styleUrls: ['./office-dialog.component.scss']
})
export class OfficeDialogComponent implements OnInit {

    oficina: Office = {};
    selectedOficina: Office = {};

    loading: boolean;
    submitted: boolean = false;
    public listaLugar: any;

    public OficinaForm: FormGroup;
    configForm: FormGroup;
    showMessage : string;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<OfficeDialogComponent>,
        private _settingS: SettingsService,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {
        this.OficinaForm = this._formBuilder.group({
            id_oficina: [''],
            id_lugar: ['',[Validators.required]],
            codigo: ['',[Validators.required]],
            nombre: ['',[Validators.required]],
            correo_oficina: ['',[Validators.required]],
            aeropuerto: ['',[Validators.required]],
            direccion: ['',[Validators.required]]
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
            this.OficinaForm.patchValue(this._data.oficina);
            this.oficina = { ...this._data.oficina };
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

    saveOficina() {

        this.submitted = true;
        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if (result == 'confirmed') {

                if (this._data.momento == 'editar') {
                    const oficina = this.OficinaForm.value;
                    Object.keys(this.OficinaForm.value).forEach(key => {
                        if(!oficina[key]){
                            oficina[key] = '';
                        }
                    });
                }

                this._settingS.postOficina(this.OficinaForm.value).subscribe(
                    (resp) => {
                        if (!resp.error) {
                            this.loading = true;
                            this.matDialogRef.close(this.OficinaForm.value);
                        }
                    }
                );
            }else{
                this.matDialogRef.close(this.OficinaForm.value);
            }
        });

    }

    /**
     * Filter por lugar
     *
     * @param change
     */
    searchLugar(query: string, tipo: string): void
    {
        this._settingS.searchLugar(query, tipo).subscribe(
            (listaLugar) => {
                this.listaLugar = listaLugar;
            }
        );
    }

    /**
     * Get Nombre Lugar
     */
    getLugar(id_lugar: string) {
        if ( this.listaLugar != undefined ) {
            return this.listaLugar.find(oficina => oficina.id_lugar === id_lugar).nombre;
        }else{
            return this.oficina.nombre_lugar;
        }
    }

}

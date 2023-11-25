import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../settings.service";
import {MatTableDataSource} from "@angular/material/table";
import {Holiday} from "../../settings.type";

@Component({
    selector: 'erp-holiday-dialog',
    templateUrl: './holiday-dialog.component.html',
    styleUrls: ['./holiday-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayDialogComponent implements OnInit {

    feriado: Holiday = {};
    public FeriadoForm: FormGroup;
    public momento: string = '';
    public loading: boolean;

    public listaLugar: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<HolidayDialogComponent>,
        private _settingS: SettingsService
    ) { }

    ngOnInit(): void {

        this.FeriadoForm = this._formBuilder.group({
            id_feriado: [''],
            fecha: ['',[Validators.required]],
            descripcion: ['',[Validators.required]],
            tipo: ['',[Validators.required]],
            id_lugar: ['',[Validators.required]],
            estado: ['',[Validators.required]],
            id_origen: ['',[Validators.required]]
        });

        if ( this._data.momento == 'editar' ) {
            this.FeriadoForm.patchValue(this._data.feriado);
            this.feriado = { ...this._data.feriado };
        }

    }

    saveFeriado() {

        if (this.momento == 'editar'){
            const feriado = this.FeriadoForm.value;
            Object.keys(this.FeriadoForm.value).forEach(key => {
                if(!feriado[key]){
                    feriado[key] = '';
                }
            });
        }

        this._settingS.postFeriado(this.FeriadoForm.value).subscribe(
            (resp) => {
                if ( !resp.error ) {
                    this.loading = true;
                    this.matDialogRef.close(this.FeriadoForm.value);
                }
            }
        );
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
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
     * GET nombre lugar
     */
    getLugar(id_lugar: string) {
        if ( this.listaLugar != undefined ) {
            return this.listaLugar.find(feriado => feriado.id_lugar === id_lugar).nombre;
        }else{
            return this.feriado.lugar;
        }
    }

}

import { Component, OnInit, Inject, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { SettingsService } from "../../settings.service";
import {Customer} from "../../settings.type";

@Component({
    selector: 'erp-customer-dialog',
    templateUrl: './customer-dialog.component.html',
    styleUrls: ['./customer-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDialogComponent implements OnInit {

    public cliente: Customer = {};
    public submitted: boolean = false;
    public momento: string = '';
    public loading: boolean;
    public ClienteForm: FormGroup;

    public listaExpedicion: any;
    public listaResidencia: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<CustomerDialogComponent>,
        private _settingS: SettingsService
    ) { }

    ngOnInit(): void {

        this.ClienteForm = this._formBuilder.group({
            id_cliente: [''],
            nombre: ['',[Validators.required]],
            apellido_paterno: ['',[Validators.required]],
            apellido_materno: [''],
            genero: ['',[Validators.required]],
            ci: ['',[Validators.required]],
            lugar_expedicion: ['',[Validators.required]],
            nacionalidad: ['',[Validators.required]],
            celular: ['',[Validators.required]],
            telefono: [''],
            email: ['',[Validators.required]],
            email2: [''],
            direccion: [''],
            id_pais_residencia: ['',[Validators.required]],
            ciudad_residencia: ['',[Validators.required]],
            barrio_zona: ['']
        });

        if ( this._data.momento == 'editar' ) {
            this.ClienteForm.patchValue(this._data.cliente);
            this.cliente = { ...this._data.cliente };
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

    /**
     * save Customer
     */
    saveCliente() {

        this.submitted = true;

        if (this.momento == 'editar'){
            const cliente = this.ClienteForm.value;
            Object.keys(this.ClienteForm.value).forEach(key => {
                if(!cliente[key]){
                    cliente[key] = '';
                }
            });
        }

        this._settingS.postCliente(this.ClienteForm.value).subscribe(
            (resp) => {
                if ( !resp.error ) {
                    this.loading = true;
                    const customerObj = {
                      customer :   this.ClienteForm.value,
                        response: resp
                    };
                    this.matDialogRef.close(customerObj);
                }
            }
        );

    }

    /**
     * Search lugar
     *
     * @param query
     * @param tipo
     */
    searchLugar(query: string, tipo: string): void
    {
        this._settingS.searchLugar(query, tipo).subscribe(
            (listaLugar) => {

                switch (tipo) {
                    case 'expedicion':
                        this.listaExpedicion = listaLugar;
                        break;
                    case 'residencia':
                        this.listaResidencia = listaLugar;
                        break;
                }

            }
        );
    }

    /**
     * Get Nombre Funcionario Recepcion
     */
    getResidencia(id_lugar: string) {
        if ( this.listaResidencia != undefined ) {
            return this.listaResidencia.find(lugar => lugar.id_lugar === id_lugar).nombre;
        }else{
            return this.cliente.pais_residencia;
        }
    }

}

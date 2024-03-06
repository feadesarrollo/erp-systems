import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CustomerListComponent} from "../customer-list/customer-list.component";
import { Subject, takeUntil } from 'rxjs';
import { OverlayRef } from "@angular/cdk/overlay";
import { MatDrawerToggleResult } from "@angular/material/sidenav";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Customer } from "../../settings.type";
import { SettingsService } from "../../settings.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'erp-customer-details',
    templateUrl: './customer-details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailsComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _tagsPanelOverlayRef: OverlayRef;

    public cliente: Customer = {};
    public submitted: boolean = false;
    public momento: string = '';
    public loading: boolean;
    public ClienteForm: FormGroup;

    public listaExpedicion: any;
    public listaResidencia: any;
    public listaNacionalidad: any;

    editMode: boolean = false;
    customer: any;
    constructor(
        private _customerListComponent: CustomerListComponent,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _settingS: SettingsService,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {

        // Open the drawer
        this._customerListComponent.matDrawer.open();
        this.ClienteForm = this._formBuilder.group({
            id_cliente: [''/*this._activatedRoute.parent.snapshot.paramMap.get('id')*/],
            nombre: ['',[Validators.required]],
            apellido_paterno: ['',[Validators.required]],
            apellido_materno: [''],
            genero: ['',[Validators.required]],
            ci: ['',[Validators.required]],
            lugar_expedicion: ['',[Validators.required]],
            nacionalidad: ['',[Validators.required]],
            celular: [''],
            telefono: [''],
            email: ['',[Validators.required]],
            email2: [''],
            direccion: ['',[Validators.required]],
            id_pais_residencia: ['',[Validators.required]],
            ciudad_residencia: ['',[Validators.required]],
            barrio_zona: ['']
        });

        // Get the customer
        this._settingS.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customer: any) => {
                // Open the drawer in case it is closed
                this._customerListComponent.matDrawer.open();

                // Get the customer
                this.customer = customer;

                this.ClienteForm.patchValue(customer);

                // Toggle the edit mode off
                this.toggleEditMode(false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._customerListComponent.matDrawer.close();
    }

    uploadAvatar(files){}

    removeAvatar(){}

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    deleteContact(){}

    updateContact(){}

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

        this._settingS.postCliente(this.ClienteForm.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
            (resp: any) => {

                if ( !resp.error ) {
                    this.toggleEditMode(false);
                    this._customerListComponent.refreshCliente();
                    //this._customerListComponent.redirect(this.customer);
                    this._changeDetectorRef.markForCheck();
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
                    case 'nacionalidad':
                        this.listaNacionalidad = listaLugar;
                        break;
                }

            }
        );
    }

    /**
     * Get pais residencia
     */
    getResidencia(id_lugar: string) {
        if ( this.listaResidencia != undefined ) {
            return this.listaResidencia.find(lugar => lugar.id_lugar === id_lugar).nombre;
        }else{
            return this.cliente.pais_residencia;
        }
    }

    /**
     * Get pais nacionalidad
     */
    getNacionalidad(id_lugar: string) {
        if ( this.listaNacionalidad != undefined ) {
            return this.listaNacionalidad.find(lugar => lugar.id_lugar === id_lugar).nombre;
        }else{
            return this.cliente.pais_residencia;
        }
    }

}

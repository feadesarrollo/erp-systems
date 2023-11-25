import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";

import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { ClaimsService } from '../../claims.service';

import { BobyMediaWatcherService } from '@boby/services/media-watcher';

@Component({
  selector: 'erp-claim-details',
  templateUrl: './claim-details.component.html'
})
export class ClaimDetailsComponent implements OnInit {

    @ViewChild('courseSteps', {static: true}) courseSteps: MatTabGroup;

    public reclamo: any;
    currentStep: number = 0;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    panelOpenState = false;

    ReclamoForm: FormGroup;

    public listaTipoIncidente: any;
    public listaSubTipoIncidente: any = [];
    public listaOrigen: any;
    public listaTransito: any;
    public listaDestino: any;

    public listaDenunciado: any;
    public listaRecepcion: any;
    public listaCliente: any;
    public listaMedioReclamo: any;
    public listaMotivoAnulado: any;
    public listaOficinaIncidente: any;
    public listaOficinaRecepcion: any;

    public editMode: boolean = false;


    /*
    * Variables Informe
    * */
    InformeForm: FormGroup;
    public editModeInf: boolean = false;
    public listaCompensacion: any;
    public listaFuncInforme: any;
    public id_informe: any;

    /*
    * Variables Gantt
    */
    listaGantt: any;

    filter$: BehaviorSubject<string> = new BehaviorSubject('reclamo');
    public officialRoles: any = [];
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _claimService: ClaimsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _bobyMediaWatcherService: BobyMediaWatcherService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.warn('ENTRA DETALLE');
        this.ReclamoForm = this._formBuilder.group({

            id_reclamo: ['',[Validators.required]],
            id_tipo_incidente: ['',[Validators.required]],
            id_subtipo_incidente: ['',[Validators.required]],
            id_medio_reclamo: ['',[Validators.required]],
            id_funcionario_recepcion: ['',[Validators.required]],
            id_funcionario_denunciado: [''],
            id_oficina_registro_incidente: ['',[Validators.required]],
            id_cliente: ['',[Validators.required]],
            fecha_hora_incidente: ['',[Validators.required]],
            nro_ripat_att: [''],

            nro_hoja_ruta: [''],//

            fecha_hora_recepcion: ['',[Validators.required]],
            fecha_hora_vuelo: ['',[Validators.required]],
            origen: ['',[Validators.required]],
            nro_frd: ['',[Validators.required]],
            correlativo_preimpreso_frd: ['', [Validators.required]],
            transito: ['',[Validators.required]],
            observaciones_incidente: ['',[Validators.required]],
            destino: ['',[Validators.required]],

            nro_pir: [''],//
            nro_frsa: [''],//

            nro_att_canalizado: [''],
            detalle_incidente: ['',[Validators.required]],
            pnr: [''],
            nro_vuelo: ['',[Validators.required]],
            id_oficina_incidente: [''],
            id_motivo_anulado: [''],
            //incidente: [''],
        });

        this.InformeForm = this._formBuilder.group({
            id_informe: [''],
            id_reclamo: [''],
            nro_informe: [{value: '', disabled: true},[Validators.required]],
            fecha_informe: ['',[Validators.required]],
            id_funcionario: ['',[Validators.required]],
            lista_compensacion: [''],
            antecedentes_informe: [''],
            analisis_tecnico: [''],
            conclusion_recomendacion: [''],
            sugerencia_respuesta: ['']
        });

        // Get Tipo Incidente
        this._claimService.loadTipoIncidente()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaTipo: any[]) => {
                this.listaTipoIncidente = listaTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media changes
        this._bobyMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Medio Reclamo
        this._claimService.loadMedioReclamo()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any[]) => {
                this.listaMedioReclamo = resp;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Motivo Anulado
        this._claimService.loadMotivoAnulado()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any[]) => {
                this.listaMotivoAnulado = resp;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Reclamos
        this._claimService.reclamo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((reclamo: any) => {
                console.warn('reclamo',reclamo);
                // Get the course
                this.reclamo = reclamo;
                this.ReclamoForm.patchValue(reclamo);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._claimService.rolesByOfficial$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rolesByOff: any) => {
                this.officialRoles = rolesByOff;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._claimService.loadSubTipoIncidente(this.reclamo.id_tipo_incidente)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter by process
     */
    filterByProcess(tipo: string): void
    {
        this.filter$.next(tipo);
    }

    /**
     * Get the filter process
     */
    get filterProcess(): string
    {
        return this.filter$.value;
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * Change value Tipo Incidente
     */
    onTipoIncidenteChange(ev){
        // Get Tipo Incidente
        this._claimService.loadSubTipoIncidente(ev.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Filter by category
     *
     * @param change
     */
    searchLugar(query: string, tipo: string): void
    {
        this._claimService.searchLugar(query).subscribe(
            (listaLugar) => {
                //eval('this.lista'+tipo+'='+listaLugar+';');
                switch (tipo) {
                    case 'origen':
                        this.listaOrigen = listaLugar;
                        break;
                    case 'transito':
                        this.listaTransito = listaLugar;
                        break;
                    case 'destino':
                        this.listaDestino = listaLugar;
                        break;
                    default:
                        this.listaDestino = [];
                }
            }
        );
    }

    /**
     * Get Nombre Cliente
     */
    getCliente(id_cliente: string) {
        if ( id_cliente !== null && id_cliente !== undefined && id_cliente !== '' && this.listaCliente != undefined ) {
            return this.listaCliente.find(cliente => cliente.id_cliente === id_cliente).nombre_completo2;
        }else{
            return this.reclamo.desc_nom_cliente;
        }
    }

    /**
     * Get Nombre Funcionario Recepcion
     */
    getFuncRecepcion(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaRecepcion != undefined ) {
            return this.listaRecepcion.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else{
            return this.reclamo.desc_nombre_funcionario;
        }
    }

    /**
     * Get Nombre Funcionario Denunciado
     */
    getFuncDenunciado(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaDenunciado != undefined ){
            return this.listaDenunciado.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else{
            return this.reclamo.desc_nombre_fun_denun;
        }
    }

    /**
     * Get Nombre Oficina Incidente
     */
    getOficinaIncidente(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' && this.listaOficinaIncidente != undefined){
            return this.listaOficinaIncidente.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else{
            return this.reclamo.desc_nombre_oficina;
        }
    }

    /**
     * Get Nombre Oficina Recepcion
     */
    getOficinaRecepcion(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' && this.listaOficinaRecepcion != undefined ){
            return this.listaOficinaRecepcion.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else{
            return this.reclamo.desc_oficina_registro_incidente;
        }
    }

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

    /**
     * Update the Reclamo
     */
    updateReclamo(): void
    {
        const reclamo = this.ReclamoForm.value;
        Object.keys(reclamo).forEach(key => {
            if(!reclamo[key]){
                reclamo[key] = '';
            }
        });

        this._claimService.guardarReclamo(this.ReclamoForm.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {

            });

        // Toggle the edit mode off
        this.toggleEditMode(false);
        //});
    }

    /**
     * load Funcionario
     */
    searchFuncionario(query: string, tipo: string): void
    {
        this._claimService.searchFuncionario(query).subscribe(
            (listaFuncionario) => {
                //eval('this.lista'+tipo+'='+listaLugar+';');
                switch (tipo) {
                    case 'denunciado':
                        this.listaDenunciado = listaFuncionario;
                        break;
                    case 'recepcion':
                        this.listaRecepcion = listaFuncionario;
                        break;
                    case 'informe':
                        this.listaFuncInforme = listaFuncionario;
                        break;
                    default:
                        this.listaDenunciado = [];
                        this.listaRecepcion = [];
                        this.listaFuncInforme = [];
                }
            }
        );
    }

    /**
     * load Cliente
     */
    searchCliente(query: string): void
    {
        this._claimService.searchCliente(query).subscribe(
            (listaCliente) => {
                this.listaCliente = listaCliente;
            }
        );
    }

    /**
     * load Oficina
     */
    searchOficina(query: string, tipo: string): void
    {
        this._claimService.searchOficina(query).subscribe(
            (resp) => {

                switch (tipo) {
                    case 'recepcion':
                        this.listaOficinaRecepcion = resp;
                        break;
                    case 'incidente':
                        this.listaOficinaIncidente = resp;
                        break;
                    default:
                        this.listaOficinaRecepcion = [];
                        this.listaOficinaIncidente = [];
                }
            }
        );
    }

    displayIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displaySubIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayMedio(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayCliente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */

    toggleEditModeInf(editMode: boolean | null = null, id_informe: number): void
    {
        if ( editMode && id_informe != undefined  && id_informe !== 0 ) {
            //this.InformeForm.get('nro_informe').disable();
            const informe = this.reclamo.informes.find(inf => inf.id_informe === id_informe);
            this.id_informe = informe.id_informe;
            this.InformeForm.patchValue(informe);
        }

        if ( editMode === null )
        {
            this.editModeInf = !this.editMode;
        }
        else
        {
            this.editModeInf = editMode;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get Nombre Funcionario Informe
     */
    getFuncInforme(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaFuncInforme != undefined ){
            return this.listaFuncInforme.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else{
            const informe = this.reclamo.informes.find(inf => inf.id_informe === this.id_informe);
            return informe.desc_fun;
        }
    }

    displayCompensaciones(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Update the Reclamo
     */
    updateInforme(): void
    {

        /*const informe = this.InformeForm.value;
        Object.keys(informe).forEach(key => {
            if(!informe[key]){
                informe[key] = '';
            }
        });*/
        this._claimService.guardarInforme(this.InformeForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {

            });

        // Toggle the edit mode off
        this.toggleEditModeInf(false,0);
        //});
    }

    openGantt(reclamo: any)
    {
        this.panelOpenState = true;
    }

    closeGantt(reclamo: any)
    {
        this.panelOpenState = false;
    }

}

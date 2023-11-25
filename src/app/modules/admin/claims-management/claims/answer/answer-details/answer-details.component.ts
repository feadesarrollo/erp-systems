import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from "@angular/material/tabs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DOCUMENT } from "@angular/common";
import { ClaimsService } from "../../claims.service";
import { BobyMediaWatcherService } from "../../../../../../../@boby/services/media-watcher";
import { MatDialog } from "@angular/material/dialog";
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'erp-answer-details',
  templateUrl: './answer-details.component.html'
})
export class AnswerDetailsComponent implements OnInit {

    @ViewChild('courseSteps', {static: true}) courseSteps: MatTabGroup;

    public answer: any;
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

    filter$: BehaviorSubject<string> = new BehaviorSubject('respuesta');
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

            nro_hoja_ruta: [''],

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
            id_motivo_anulado: ['']
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

        // Get Reclamos
        this._claimService.answer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((answer: any) => {
                // Get the answer
                this.answer = answer;
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
}

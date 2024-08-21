import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Subject, takeUntil, Observable } from 'rxjs';
import { ClaimsService } from '../../claims.service';
import { Claim, Category } from '../../claims.types';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ClaimDialogComponent } from '../claim-dialog/claim-dialog.component';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BobyConfirmationService } from '@boby/services/confirmation';

import { WizardDialogComponent } from "../wizard-dialog/wizard-dialog.component";

import { Select, Store } from '@ngxs/store';
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";
import {
    AddSelectedState,
    AddState,
    AddYear,
    AddSelectedYear,
    AddPermissions,
    AddViewer, AddQuery
} from "../../../../../../../store/claims-management/claims-management.actions";
import {ClaimContainerDialogComponent} from "../claim-container-dialog/claim-container-dialog.component";
import {PreviousDialogComponent} from "../previous-dialog/previous-dialog.component";
import {ClaimMailComposeComponent} from "../claim-mail-compose/claim-mail-compose.component";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {cloneDeep} from "lodash-es";
import {Sort} from "@angular/material/sort";
import {debounceTime} from "rxjs/operators";
import {ClaimRipatComponent} from "../claim-ripat/claim-ripat.component";
import {TreeNode} from "primeng/api";
import { MessageService } from "primeng/api";
import {BobyMockApiUtils} from "../../../../../../../@boby/lib/mock-api";
@Component({
    selector: 'erp-claim-list',
    templateUrl: './claim-list.component.html',
    styleUrls: ['./claim-list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimListComponent implements OnInit {

    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getSelectedState) selectedState$: Observable<any>;
    @Select(ClaimsManagementState.getSelectedYear) selectedYear$: Observable<any>;
    @Select(ClaimsManagementState.getYear) year$: Observable<any>;
    @Select(ClaimsManagementState.getQuery) querie$: Observable<any>;
    @Select(ClaimsManagementState.getViewer) viewer$: Observable<any>;
    /******************************** STORE ********************************/
    statesByOfficial: Category[];
    reclamos: any[] = [];
    filteredReclamos: any[] = [];

    isLoading: boolean = false;
    filters: {
        categorySlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
        hideCompleted$: BehaviorSubject<boolean>;
    } = {
        categorySlug$ : new BehaviorSubject('all'),
        query$        : new BehaviorSubject(''),
        hideCompleted$: new BehaviorSubject(false)
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private scrollStrategy: ScrollStrategy;

    configForm: FormGroup;

    private estado: string = 'borrador';

    public totalRows = 0;
    public currentPage = 0;
    public pageSize = 6;

    pageSizeOptions: number[] = [3,6,12,24,45,90,120,360];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    public pagination: any;

    public listYear: any;
    public selectedState = 'borrador';
    public selectedYear: any;
    public FilterForm: FormGroup;
    private storeStatus = true;
    private momento: string;

    public selectedClaim: any = {};
    public officialRoles: any = [];
    public rolesAllowed: any = [];
    public viewer = 'grid';
    private query = '';
    public displayedColumns = [
        'accion','nro_tramite','dias_respuesta','desc_nom_cliente','desc_nombre_funcionario','dias_informe','correlativo_preimpreso_frd','nro_frsa','nro_pir','nro_att_canalizado','nro_ripat_att',
        'nro_hoja_ruta','pnr','nro_vuelo','fecha_hora_vuelo','origen','transito','destino','desc_nombre_incidente','desc_sudnom_incidente','fecha_hora_incidente',
        'desc_oficina_registro_incidente', 'detalle_incidente','observaciones_incidente','desc_nombre_fun_denun','desc_nombre_oficina','fecha_hora_recepcion',
        'desc_nombre_medio','motivo_anulado',
        'estado_reg', 'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
    ];
    public cols = [
        { field: 'nro_tramite', header: 'Nro. Tramite', width: 'min-w-36'},
        { field: 'dias_respuesta', header: 'Dias Para Responder', width: 'min-w-36'},
        { field: 'desc_nom_cliente', header: 'Cliente', width: 'min-w-64'},
        { field: 'desc_nombre_funcionario', header: 'Funcionario', width: 'min-w-72'},
        { field: 'dias_informe', header: 'Dias Informe', width: 'min-w-28'},
        { field: 'correlativo_preimpreso_frd', header: 'Preimpreso FRD', width: 'min-w-28'},
        { field: 'nro_frsa', header: 'Nro. frsa', width: 'min-w-28'},
        { field: 'nro_pir', header: 'Nro. Pir', width: 'min-w-28'},
        { field: 'nro_att_canalizado', header: 'ATT Canalizado', width: 'min-w-28'},
        { field: 'nro_ripat_att', header: 'Ripat ATT', width: 'min-w-28'},
        { field: 'nro_hoja_ruta', header: 'Hoja Ruta', width: 'min-w-28'},
        { field: 'pnr', header: 'PNR', width: 'min-w-28'},
        { field: 'nro_vuelo', header: 'Nro. Vuelo', width: 'min-w-28'},
        { field: 'fecha_hora_vuelo', header: 'Fecha, Hora Vuelo', width: 'min-w-32'},
        { field: 'origen', header: 'Origen', width: 'min-w-32'},
        { field: 'transito', header: 'Transito', width: 'min-w-32'},
        { field: 'destino', header: 'Destino', width: 'min-w-32'},
        { field: 'desc_nombre_incidente', header: 'Nombre Incidente', width: 'min-w-44'},
        { field: 'desc_sudnom_incidente', header: 'Subtipo Incidente', width: 'min-w-44'},
        { field: 'fecha_hora_incidente', header: 'Fecha Incidente', width: 'min-w-32'},

        { field: 'desc_oficina_registro_incidente', header: 'Oficina Registro', width: 'min-w-52'},
        { field: 'detalle_incidente', header: 'Detalle Incidente', width: 'min-w-96'},
        { field: 'observaciones_incidente', header: 'Observacion Incidente', width: 'min-w-96'},
        { field: 'desc_nombre_fun_denun', header: 'Funcionario Denunciado', width: 'min-w-52'},
        { field: 'desc_nombre_oficina', header: 'Ofina Recepcion', width: 'min-w-52'},
        { field: 'fecha_hora_recepcion', header: 'Fecha Recepcion', width: 'min-w-32'},
        { field: 'desc_nombre_medio', header: 'Nombre Medio', width: 'min-w-60'},
        { field: 'motivo_anulado', header: 'Motivo Anulado', width: 'min-w-52'},

        { field: 'estado_reg', header: 'Estado', width: 'min-w-28'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];

    private listCheck: any;
    private displayedColumnsCheck = cloneDeep(this.displayedColumns);
    private hiddenColumns = ['detalle_incidente','observaciones_incidente'];
    private sort = 'id_reclamo';
    private dir = 'desc';

    public display: boolean = false;

    public data = [{
        label: 'Root',
        expanded: true,
        children: [
            {
                label: 'Child 1',
                expanded: true,
                children: [
                    {
                        label: 'Grandchild 1.1'
                    },
                    {
                        label: 'Grandchild 1.2'
                    }
                ]
            },
            {
                label: 'Child 2',
                expanded: true,
                children: [
                    {
                        label: 'Child 2.1'
                    },
                    {
                        label: 'Child 2.2'
                    }
                ]
            }
        ]
    }];

    selectedNode: TreeNode;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _claimService: ClaimsService,
        private _matDialog: MatDialog,
        private readonly sso: ScrollStrategyOptions,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService,
        private _store: Store,
        private messageService: MessageService
        /*private _loadService: BobyLoadingService*/
    )
    {
        this.scrollStrategy = this.sso.noop();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        let col;
        this.displayedColumnsCheck.shift();
        this.listCheck = this.displayedColumnsCheck.map( (item,index) => {
            col = this.cols.find(elem => elem.field == item);
            if ( this.hiddenColumns.includes(col.field) ){
                this.displayedColumns = this.displayedColumns.filter( item => item !== col.field);
                return {field: col.field, header: col.header, width: col.width, checked: false, order: index + 1};
            }else{
                return {field: col.field, header: col.header, width: col.width, checked: true, order: index + 1};
            }
        });

        this.FilterForm = this._formBuilder.group({
            query: [''],
            state: ['borrador'],
            year: [null],
        });

        this._claimService.rolesByOfficial$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rolesByOff: any) => {

                this.officialRoles = rolesByOff;

                this._store.dispatch(new AddPermissions(this.officialRoles));

                let statesByOff = [];
                rolesByOff.states.map(item => {
                    statesByOff = [...statesByOff,{id:item, nombre:item.split('_').map(str => str.toUpperCase()).join(' ')}]
                });

                this.statesByOfficial = statesByOff;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        /******************************** STORE ********************************/
        this.selectedState$.subscribe((selectedState)=>{
            if ( selectedState != null || selectedState != undefined ) {
                this.selectedState = selectedState;
                this.FilterForm.get('state').setValue(selectedState);
                this.storeStatus = false;
            }
        });

        this.year$.subscribe((year)=>{
            if ( year != null || year != undefined ) {
                this.listYear = year;
            }
        });

        this.selectedYear$.subscribe((selectedYear)=>{

            if ( selectedYear != null || selectedYear != undefined ) {

                this.selectedYear = selectedYear;

                this.FilterForm.get('year').setValue(this.selectedYear.id_gestion);
                this.storeStatus = false;
            }
        });

        this.viewer$.subscribe((viewer)=>{
            this.viewer = viewer;
        });

        this.querie$.subscribe((query)=>{
            this.query = query;
            this.FilterForm.get('query').setValue(this.query);
            if( this.query != '' ){
                this.filterByQuery(this.query);
            }
        });
        /******************************** STORE ********************************/
        console.warn('this.officialRoles',this.officialRoles);
        if ( this.officialRoles.permitsClaim?.length > 0 ){
            this.rolesAllowed = this.officialRoles.permitsClaim.find(perm => perm.states.includes(this.selectedState))?.permission || [];
        }

        if ( this.storeStatus ){
            this._claimService.fetchYear()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((years: any) => {

                    this.listYear = years.datos;
                    this._store.dispatch(new AddYear(years.datos));
                    this.selectedYear = this.listYear.find(year => year.gestion == new Date().getFullYear());
                    this.FilterForm.get('year').setValue(this.selectedYear.id_gestion);
                    this._store.dispatch(new AddSelectedYear(this.selectedYear));

                    /**************************************** GET CLAIMS ****************************************/
                    // Get the claims
                    this._claimService.getReclamos(this.selectedState,this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir,this.query).subscribe(
                        (response: any) => {
                            //const resp = JSON.parse(response.datos[0].listclaims);
                            this.reclamos = this.filteredReclamos = response.claims;
                            this.totalRows = response.total;
                            /*this.paginator._intl.itemsPerPageLabel="Registros por pagina";
                            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                                if (length === 0 || pageSize === 0) {
                                    return `0 de ${length }`;
                                }
                                length = Math.max(length, 0);
                                const startIndex = page * pageSize;
                                // If the start index exceeds the list length, do not try and fix the end index to the end.
                                const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                                return `${startIndex + 1} - ${endIndex} de ${length}`;
                            };
                            this.paginator._intl.nextPageLabel = 'Página Siguiente';
                            this.paginator._intl.firstPageLabel = 'Primera Página';
                            this.paginator._intl.lastPageLabel = 'Ultima Página';
                            this.paginator._intl.previousPageLabel = 'Página Anterior';

                            this.paginator.pageIndex = this.currentPage;
                            this.paginator.length = this.totalRows;*/

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        }
                    );
                    /**************************************** GET CLAIMS ************************************/

                    this._changeDetectorRef.markForCheck();

                });

        }else{
            // Get the claims
            this._claimService.getReclamos(this.selectedState,this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir,this.query).subscribe(
                (response: any) => {
                    this.reclamos = this.filteredReclamos = response.claims;
                    this.totalRows = response.total;

                    /*this.paginator._intl.itemsPerPageLabel="Registros por pagina";
                    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                        if (length === 0 || pageSize === 0) {
                            return `0 de ${length }`;
                        }
                        length = Math.max(length, 0);
                        const startIndex = page * pageSize;
                        // If the start index exceeds the list length, do not try and fix the end index to the end.
                        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                        return `${startIndex + 1} - ${endIndex} de ${length}`;
                    };
                    this.paginator._intl.nextPageLabel = 'Página Siguiente';
                    this.paginator._intl.firstPageLabel = 'Primera Página';
                    this.paginator._intl.lastPageLabel = 'Ultima Página';
                    this.paginator._intl.previousPageLabel = 'Página Anterior';

                    this.paginator.pageIndex = this.currentPage;
                    this.paginator.length = this.totalRows;*/

                    // Mark for check
                    this._changeDetectorRef.markForCheck();

                }
            );
        }

        // Filter the claims
        /*combineLatest([ this.filters.query$, this.filters.hideCompleted$ ])
            .subscribe(([ query, hideCompleted ]) => {

                // Reset the filtered claims
                this.filteredReclamos = this.reclamos;
                // Filter by search query
                if ( query !== '' )
                {
                    this.filteredReclamos = this.filteredReclamos.filter(reclamo =>
                        reclamo.nro_frd?.toLowerCase().includes(query.toLowerCase())
                        || reclamo.nro_tramite?.toLowerCase().includes(query.toLowerCase())
                        || reclamo.desc_nom_cliente?.toLowerCase().includes(query.toLowerCase())
                        || reclamo.nro_vuelo?.toLowerCase().includes(query.toLowerCase())
                        || reclamo.usr_reg?.toLowerCase().includes(query.toLowerCase())
                    );
                }

                // Filter by completed
                if ( hideCompleted )
                {
                    this.filteredReclamos = this.filteredReclamos.filter(reclamo => reclamo.estado === 'finalizado');
                }
            });*/

        this.FilterForm.get('query').valueChanges
            .pipe(debounceTime(1000))
            .subscribe(query => {

                this.query = query;
                this._store.dispatch(new AddQuery(this.query));

                this._claimService.filterByQuery(this.query,this.selectedState,this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir).subscribe(
                    (claimsList: any) => {
                        const resp = JSON.parse(claimsList.datos[0].listclaims);
                        this.filteredReclamos = resp.claims;
                        this.totalRows = resp.total;
                        this._changeDetectorRef.markForCheck();
                    }
                );
            });
    }

    viewState(){
        this._changeDetectorRef.markForCheck();
    }

    toggleChange(event){
        this.viewer = event.source.value;
        this._store.dispatch(new AddViewer(this.viewer));
    }

    showOptions(event:MatCheckboxChange): void {
        const item = this.listCheck.filter((elem) => {
            if (elem.field == event.source.value){
                elem.checked = event.checked
                return elem;
            }
        });

        if (event.checked){
            this.displayedColumns.splice(item[0].order,0,event.source.value);
        }else{
            this.displayedColumns = this.displayedColumns.filter( item => item !== event.source.value);
        }
        //this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit() {
        if ( this.paginator ) {
            this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                if (length === 0 || pageSize === 0) {
                    return `0 de ${length}`;
                }
                length = Math.max(length, 0);
                const startIndex = page * pageSize;
                // If the start index exceeds the list length, do not try and fix the end index to the end.
                const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                return `${startIndex + 1} - ${endIndex} de ${length}`;
            };
            this.paginator._intl.nextPageLabel = 'Página Siguiente';
            this.paginator._intl.firstPageLabel = 'Primera Página';
            this.paginator._intl.lastPageLabel = 'Ultima Página';
            this.paginator._intl.previousPageLabel = 'Página Anterior';

            this.paginator.pageIndex = this.currentPage;
            this.paginator.length = this.totalRows;
        }
    }

    redirect (row){
        this._router.navigate(['./', row.id_reclamo], {relativeTo: this._activatedRoute});
    }

    openDialogRipat(){
        //this._router.navigate(['/system/claims-management/claims/claim/details'], {relativeTo: this._activatedRoute});
        const dialogRef = this._matDialog.open(ClaimRipatComponent, {
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }
    executeCommand(momento: string, claim : any){

        this.selectedClaim = claim;
        if ( ['log','informe','respuesta','documento','gantt'].includes(momento) ) {
            const dialogRef = this._matDialog.open(ClaimContainerDialogComponent, {
                height: '80%',
                width: '70%',
                data: {
                    claim,
                    momento
                },
                disableClose: true
            });

            dialogRef.afterClosed()
                .subscribe((result) => {

                });
        }else if (['update'].includes(momento)){
            const dialogRef = this._matDialog.open(ClaimDialogComponent,{
                height: '75%',
                width: '90%',
                data: {
                    claim: claim,
                    momento: 'editar',
                    selectedYear: this.selectedYear
                },
                disableClose: true
            });

            dialogRef.afterClosed()
                .subscribe((result) => {
                    //this.reloadReclamo();
                });
        }else if (['delete'].includes(momento)){

            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `Estimado Usuario, esta seguro de eliminar el registro?`,
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'Confirmar',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: 'Cancelar'
                    })
                }),
                dismissible: true
            });

            const dialogRef = this._fcService.open(this.configForm.value);

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {
                    this._claimService.deleteClaim(claim)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            if (response.error) {
                                // Build the config form
                                this.configForm = this._formBuilder.group({
                                    title: 'Alerta',
                                    message: `<p class="font-bold">${response.message}</p>`,
                                    icon: this._formBuilder.group({
                                        show: true,
                                        name: 'heroicons_outline:exclamation',
                                        color: 'warn'
                                    }),
                                    actions: this._formBuilder.group({
                                        confirm: this._formBuilder.group({
                                            show: true,
                                            label: 'Aceptar',
                                            color: 'warn'
                                        }),
                                        cancel: this._formBuilder.group({
                                            show: false,
                                            label: 'Cancelar'
                                        })
                                    }),
                                    dismissible: true
                                });

                                const dialogRef = this._fcService.open(this.configForm.value);

                                dialogRef.afterClosed().subscribe((result) => {

                                });
                            }else {
                                this.reloadReclamo();
                            }
                        });
                }else{

                }
            });
        }else if( ['derive'].includes(momento) ){
            this.openComposeDialog(claim);
        }

    }

    /**
     * Open compose dialog
     */
    openComposeDialog(claim): void
    {
        // Open the dialog
        const dialogRef = this._matDialog.open(ClaimMailComposeComponent,{
            data: {
                claim
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this._claimService.getReclamos(this.selectedState, this.selectedYear.id_gestion,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                //const resp = JSON.parse(response.datos[0].listclaims);
                this.reclamos = this.filteredReclamos = response.claims;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    sortData(sort: Sort) {
        this.sort = sort.active;
        this.dir = sort.direction;
        this._claimService.getReclamos(this.selectedState, this.selectedYear.id_gestion,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                //const resp = JSON.parse(response.datos[0].listclaims);
                this.reclamos = this.filteredReclamos = response.claims;
                this._changeDetectorRef.markForCheck();

            }
        );
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
     * Filter by category
     *
     * @param change
     */
    filterByState(change: MatSelectChange): void
    {
        if ( this.officialRoles.permitsClaim?.length > 0 ){
            this.rolesAllowed = this.officialRoles.permitsClaim.find(perm => perm.states.includes(change.value))?.permission || [];
        }
        this._store.dispatch(new AddSelectedState(change.value));
        this.pageSize = 6;
        this.currentPage = 0;
        this.estado = change.value;
        this._claimService.getReclamos(change.value, this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response: any) => {

                //const resp = JSON.parse(response.datos[0].listclaims);

                this.reclamos = this.filteredReclamos = response.claims || [];

                this.totalRows = response.total;

                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * Reload Reclamos
     *
     */
    reloadReclamo(): void
    {
        this._claimService.getReclamos(this.selectedState, this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response: any) => {
                this.reclamos = this.filteredReclamos = response.claims;
                this.totalRows = response.total;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this.query = query;
        this._store.dispatch(new AddQuery(this.query));

        this._claimService.filterByQuery(this.query,this.selectedState,this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir).subscribe(
            (claimsList: any) => {
                const resp = JSON.parse(claimsList.datos[0].listclaims);
                this.filteredReclamos = resp.claims;
                this.totalRows = resp.total;
                this._changeDetectorRef.markForCheck();
            }
        );

    }

    onGestionChange(ev){

        this.selectedYear = this.listYear.find(item => item.id_gestion === ev.value);
        this._store.dispatch(new AddSelectedYear(this.selectedYear));

        this._claimService.getReclamos(this.selectedState, this.selectedYear.id_gestion,this.currentPage,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response: any) => {

                //const resp = JSON.parse(response.datos[0].listclaims);
                this.reclamos = this.filteredReclamos = response.claims;
                this.totalRows = response.total;

                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * fetch year
     */
    fetchYear(): void
    {
        this._claimService.fetchYear()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((years: any) => {

                this.listYear = years.datos;
                this._store.dispatch(new AddYear(years.datos));
                this.selectedYear = this.listYear.find(year => year.gestion == new Date().getFullYear());
                this.FilterForm.get('year').setValue(this.selectedYear.id_gestion);
                this._store.dispatch(new AddSelectedYear(this.selectedYear));

                this._changeDetectorRef.markForCheck();

            });
    }

    /**
     * Show/hide completed courses
     *
     * @param change
     */
    toggleCompleted(change: MatSlideToggleChange): void
    {
        this.filters.hideCompleted$.next(change.checked);
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

    onNodeSelect(event) {
        this.messageService.add({severity: 'success', summary: 'Node Selected', detail: event.node.label});
    }

    /**
     * Create a new Claim
     */
    createReclamo(){

        this.momento = 'nuevo';
        //this._router.navigate(['/system/claims-management/claims/claim/new-claim/', BobyMockApiUtils.guid()], {relativeTo: this._activatedRoute});
        const dialogRef = this._matDialog.open(ClaimDialogComponent,{
            height: '75%',
            width: '60%',
            data: {
                momento: this.momento,
                selectedYear: this.selectedYear
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.reloadReclamo();
                }
            });

    }

    goToAnterior(claim: any): void
    {

        const dialogRef = this._matDialog.open(PreviousDialogComponent, {
            height: '50%',
            width: '50%',
            data: {
                process: claim,
                endpoint: 'reclamo/Reclamo/anteriorEstadoReclamo'
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (result != undefined) {
                    if (result.error) {
                        // Build the config form
                        this.configForm = this._formBuilder.group({
                            title: 'Alerta',
                            message: `<p class="font-bold">${result.message}</p>`,
                            icon: this._formBuilder.group({
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warn'
                            }),
                            actions: this._formBuilder.group({
                                confirm: this._formBuilder.group({
                                    show: true,
                                    label: 'Aceptar',
                                    color: 'warn'
                                }),
                                cancel: this._formBuilder.group({
                                    show: false,
                                    label: 'Cancelar'
                                })
                            }),
                            dismissible: true
                        });

                        const dialogRef = this._fcService.open(this.configForm.value);

                        dialogRef.afterClosed().subscribe((result) => {

                        });
                    }else{
                        this.reloadReclamo();
                    }
                }
            });

    }
    goToSiguiente(reclamo: any): void
    {
        this.selectedClaim = reclamo;

        if ( reclamo.nro_ripat_att == null  && reclamo.estado == 'pendiente_revision') {
            this._claimService.listFormColumn(reclamo.id_estado_wf)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response: any) => {

                    const dialogRef = this._matDialog.open(ClaimDialogComponent, {
                        height: '90%',
                        width: '70%',
                        data: {
                            claim: reclamo,
                            momento: 'editar',
                            fields: response.datos
                        },
                        disableClose: true
                    });

                    dialogRef.afterClosed()
                        .subscribe((result) => {
                            this.reloadReclamo()
                        });

                    this._changeDetectorRef.markForCheck();

                });
        }else {

            const dialogRef = this._matDialog.open(WizardDialogComponent, {
                height: '90%',
                width: '70%',
                data: {
                    id_proceso_wf: reclamo.id_proceso_wf,
                    id_estado_wf: reclamo.id_estado_wf,
                    endpoint: 'reclamo/Reclamo/siguienteEstadoReclamo'
                },
                disableClose: true
            });

            dialogRef.afterClosed()
                .subscribe((result) => {
                    if (result != undefined) {
                        if (result.error) {
                            // Build the config form
                            this.configForm = this._formBuilder.group({
                                title: 'Alerta',
                                message: `<p class="font-bold">${result.message}</p>`,
                                icon: this._formBuilder.group({
                                    show: true,
                                    name: 'heroicons_outline:exclamation',
                                    color: 'warn'
                                }),
                                actions: this._formBuilder.group({
                                    confirm: this._formBuilder.group({
                                        show: true,
                                        label: 'Aceptar',
                                        color: 'warn'
                                    }),
                                    cancel: this._formBuilder.group({
                                        show: false,
                                        label: 'Cancelar'
                                    })
                                }),
                                dismissible: true
                            });

                            const dialogRef = this._fcService.open(this.configForm.value);

                            dialogRef.afterClosed().subscribe((result) => {

                            });
                        } else {
                            // Build the config form
                            if ( reclamo.estado == 'borrador' ) {
                                this.configForm = this._formBuilder.group({
                                    title: 'Alerta',
                                    message: `<p class="font-bold">A partir de este momento usted tiene 72 horas para registrar el informe correspondiente y Adjuntar Documentacion de Respaldo.</p>`,
                                    icon: this._formBuilder.group({
                                        show: true,
                                        name: 'heroicons_outline:exclamation',
                                        color: 'warn'
                                    }),
                                    actions: this._formBuilder.group({
                                        confirm: this._formBuilder.group({
                                            show: true,
                                            label: 'Aceptar',
                                            color: 'warn'
                                        }),
                                        cancel: this._formBuilder.group({
                                            show: false,
                                            label: 'Cancelar'
                                        })
                                    }),
                                    dismissible: true
                                });

                                const dialogRef = this._fcService.open(this.configForm.value);

                                dialogRef.afterClosed().subscribe((result) => {

                                });
                            }
                            this.reloadReclamo();
                        }
                    }
                });
        }
    }


}

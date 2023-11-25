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
import { BehaviorSubject, combineLatest, Subject, takeUntil, Observable  } from 'rxjs';
import { ClaimsService } from '../../claims.service';
import { Claim, Category } from '../../claims.types';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BobyConfirmationService } from '@boby/services/confirmation';
import { WizardDialogComponent } from "../../claim/wizard-dialog/wizard-dialog.component";
import {PreviousDialogComponent} from "../../claim/previous-dialog/previous-dialog.component";
import {
    AddPermissions, AddSelectedState,
    AddSelectedYear,
    AddYear
} from "../../../../../../../store/claims-management/claims-management.actions";
import {Select, Store} from "@ngxs/store";
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";

@Component({
    selector: 'erp-answer-list',
    templateUrl: './answer-list.component.html',
    styleUrls: ['./answer-list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnswerListComponent implements OnInit {

    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getSelectedState) selectedState$: Observable<any>;
    @Select(ClaimsManagementState.getSelectedYear) selectedYear$: Observable<any>;
    @Select(ClaimsManagementState.getYear) year$: Observable<any>;
    /******************************** STORE ********************************/

    categorias: Category[];
    answers: any[] = [];
    filteredAnswers: any[] = [];

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

    private estado: string = 'elaboracion_respuesta';

    totalRows = 0;
    pageSize = 6;
    currentPage = 0;
    pageSizeOptions: number[] = [3, 6, 12, 24, 45];
    @ViewChild(MatPaginator) paginator: MatPaginator;

    public officialRoles: any = [];
    public rolesAllowed: any = [];

    public FilterAnsForm: FormGroup;
    public listYearAnswer: any = [];
    public selectedYearAnswer: any;

    statesByOfficial: Category[];
    public listYear: any;
    public selectedState = 'elaboracion_respuesta';
    public selectedYear: any;
    private storeStatus = true;
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
        private _store: Store
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

        this.FilterAnsForm = this._formBuilder.group({
            queryAns: [null],
            stateAns: ['elaboracion_respuesta'],
            yearAns: [null],
        });

        this.categorias = [
            {id:'elaboracion_respuesta', nombre:'Elaboracion de Respuesta'},
            {id:'vobo_respuesta',nombre:'Visto Bueno Respuesta'},
            {id:'respuesta_aprobada',nombre:'Respuesta Aprobada'},
            {id:'respuesta_enviada',nombre:'Respuesta Enviada'},
            {id:'revision_legal',nombre:'Revisión Legal'},

        ];



        this._claimService.rolesByOfficial$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rolesByOff: any) => {

                this.officialRoles = rolesByOff;
                this._store.dispatch(new AddPermissions(this.officialRoles));
                /*if ( !localStorage.getItem('officialRoles') ) {
                    localStorage.setItem('officialRoles', JSON.stringify(this.officialRoles));
                }*/

                let statesByOff = [];
                rolesByOff.states.map(item => {
                    statesByOff = [...statesByOff,{id:item, nombre:item.split('_').map(str => str.toUpperCase()).join(' ')}]
                });

                this.statesByOfficial = statesByOff;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        /******************************** STORE ********************************/
        /*this.selectedState$.subscribe((selectedState)=>{
            if ( selectedState != null || selectedState != undefined ) {
                this.selectedState = selectedState;
                this.FilterAnsForm.get('stateAns').setValue(selectedState);
                this.storeStatus = false;
            }
        });

        this.year$.subscribe((year)=>{
            if ( year != null || year != undefined ) {
                this.listYear = year;
            }
        });

        this.selectedYear$.subscribe((selectedYear)=>{
            console.warn('selectedYear',selectedYear);
            if ( selectedYear != null || selectedYear != undefined ) {

                this.listYearAnswer = selectedYear;

                this.FilterAnsForm.get('yearAns').setValue(this.listYearAnswer.id_gestion);
                this.storeStatus = false;
            }
        });*/

        /******************************** STORE ********************************/

        if ( this.officialRoles.permitsClaim?.length > 0 ){
            this.rolesAllowed = this.officialRoles.permitsClaim.find(perm => perm.states.includes(this.selectedState))?.permission || [];
        }

        //if ( this.storeStatus ) {

            this._claimService.fetchYear()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((years: any) => {

                    this.listYearAnswer = years.datos;
                    //this._store.dispatch(new AddYear(years.datos));

                    this.selectedYearAnswer = this.listYearAnswer.find(year => year.gestion == new Date().getFullYear());
                    this.FilterAnsForm.get('yearAns').setValue(this.selectedYearAnswer.id_gestion);

                    //this._store.dispatch(new AddSelectedYear(this.selectedYearAnswer));
                    // Get the answer
                    this._claimService.getAnswerList(this.selectedState,this.selectedYearAnswer.gestion,0,6).subscribe(
                        (response: any) => {

                            const resp = JSON.parse(response.datos[0].listanswer);
                            this.answers = this.filteredAnswers = resp.answers || [];
                            this.totalRows = resp.total;

                            this.paginator._intl.itemsPerPageLabel="Registros por pagina";
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
                            this.paginator.length = this.totalRows;

                            // Mark for check
                            this._changeDetectorRef.markForCheck();

                        });

                    this._changeDetectorRef.markForCheck();
                });

        /*}else{

            // Get the claims
            this._claimService.getAnswerList(this.selectedState,this.selectedYearAnswer.gestion,0,6).subscribe(
                (response: any) => {

                    const resp = JSON.parse(response.datos[0].listanswer);
                    this.answers = this.filteredAnswers = resp.answers || [];
                    this.totalRows = resp.total;

                    this.paginator._intl.itemsPerPageLabel="Registros por pagina";
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
                    this.paginator.length = this.totalRows;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();

                });

        }*/

    }

    /**
     * Reload Reclamos
     *
     */
    reloadAnswer(): void
    {
        this._claimService.getAnswerList(this.estado,this.selectedYearAnswer.gestion,0,6).subscribe(
            (response: any) => {
                const resp = JSON.parse(response.datos[0].listanswer);
                this.answers = this.filteredAnswers = resp.answers || [];
                this.totalRows = resp.total;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * Year change
     *
     */
    onGestionChange(ev){
        this.selectedYearAnswer = this.listYearAnswer.find(item => item.id_gestion === ev.value);

        this._store.dispatch(new AddSelectedYear(this.selectedYearAnswer));

        this._claimService.getAnswerList(this.estado,this.selectedYearAnswer.gestion,0,6).subscribe(
            (response: any) => {
                const resp = JSON.parse(response.datos[0].listanswer);
                this.answers = this.filteredAnswers = resp.answers || [];
                this.totalRows = resp.total;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit() {

    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this._claimService.getAnswerList(this.estado,this.selectedYearAnswer.gestion,this.currentPage*this.pageSize,this.pageSize).subscribe(
            (response) => {
                this.answers = this.filteredAnswers = response;
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
        this.selectedState = change.value;
        this._claimService.getAnswerList(change.value,this.selectedYearAnswer.gestion,0,6).subscribe(
            (response: any) => {
                const resp = JSON.parse(response.datos[0].listanswer);
                this.answers = this.filteredAnswers = resp.answers || [];
                this.totalRows = resp.total;
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
        this.filters.query$.next(query);
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

    goToAnterior(answer: any): void
    {
        const dialogRef = this._matDialog.open(PreviousDialogComponent, {
            height: '50%',
            width: '50%',
            data: {
                process: answer,
                endpoint: 'reclamo/Respuesta/anteriorEstadoRespuesta'
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
                        this.reloadAnswer();
                    }
                }
            });
    }
    goToSiguiente(reclamo: any): void
    {
        const dialogRef = this._matDialog.open(WizardDialogComponent,{
            data: {
                id_proceso_wf :reclamo.id_proceso_wf,
                id_estado_wf :reclamo.id_estado_wf,
                endpoint: 'reclamo/Respuesta/siguienteEstadoRespuesta'
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if (result.error){
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
                }else {
                    this.reloadAnswer();
                }
            });
    }

}

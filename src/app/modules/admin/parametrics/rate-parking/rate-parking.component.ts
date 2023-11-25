import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { RateParking } from "../parametrics.type";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { ParametricsService } from "../parametrics.service";
import { takeUntil, Subject, switchMap, map, debounceTime, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'lan-rate-parking',
    templateUrl: './rate-parking.component.html',
    styleUrls: ['./rate-parking.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RateParkingComponent implements OnInit {

    rateParking: RateParking = {};
    selectedRateParking: RateParking = {};

    cols: any[] = [];
    submitted: boolean = false;
    rateParkingDialog: boolean = false;
    deleteRateParkingDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns: string[];

    /***************************************** RATE LANDING *****************************************/

    displayedColumnsRL = ['country','entity','categoryAto','nombreEstacion','codEstacion','servicio','tipoTrafico','pesoMinimo',
        'pesoMaximo','tarifa','currency','startDate_yyyyMMdd','endDate_yyyyMMdd'];
    colsRL = [
        { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
        { field: 'endDate_yyyyMMdd', header: 'Fecha Fin', width: 'min-w-32'},
        { field: 'country', header: 'Pais', width: 'min-w-32'},
        { field: 'entity', header: 'Entidad', width: 'min-w-32'},
        { field: 'categoryAto', header: 'Categoria Ato', width: 'min-w-32'},
        { field: 'nombreEstacion', header: 'Nombre Ato', width: 'min-w-72'},
        { field: 'codEstacion', header: 'Codigo Ato', width: 'min-w-32'},
        { field: 'servicio', header: 'Servicio', width: 'min-w-32'},
        { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-44'},
        { field: 'pesoMinimo', header: 'Peso Minimo', width: 'min-w-32'},
        { field: 'pesoMaximo', header: 'Peso Maximo', width: 'min-w-32'},
        { field: 'tarifa', header: 'Tarifa', width: 'min-w-32'},
        { field: 'currency', header: 'Moneda', width: 'min-w-52'}

    ];
    dataSourceRL: MatTableDataSource<any>;
    public rateLandingDialog: boolean = false;
    /***************************************** RATE LANDING *****************************************/

    loading: boolean;
    momento: string = '';
    public RateParkingForm: FormGroup;
    public listRateLanding: any;
    public filteredRateLanding: any;

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _parametricS: ParametricsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.RateParkingForm = this._formBuilder.group({
            minSinCosto: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            hrsEstacionamiento: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            tarifaAterrizajeId: ['',[Validators.required]],
            porcentaje: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            fromula: ['',[Validators.required]],
            id: [''],
            startDate_yyyyMMdd: ['',[Validators.required]],
            endDate_yyyyMMdd: ['',[Validators.required]]
        });

        this.displayedColumns = ['accion','tarifa','minSinCosto','hrsEstacionamiento','porcentaje','fromula',
            'startDate_yyyyMMdd','endDate_yyyyMMdd'];
        this.cols = [
            { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
            { field: 'endDate_yyyyMMdd', header: 'Fecha Fin', width: 'min-w-32'},
            { field: 'minSinCosto', header: 'Min. Sin/Costo', width: 'min-w-32'},
            { field: 'hrsEstacionamiento', header: 'Horas Parqueo', width: 'min-w-32'},
            { field: 'porcentaje', header: 'Porcentaje', width: 'min-w-32'},
            { field: 'fromula', header: 'Formula', width: 'min-w-72'}
        ];

        this._selectedColumns = this.cols;

        this._parametricS.getAllRateParking().subscribe(
            (resp: any) => {

                this.listRateLanding = this.filteredRateLanding = resp.rateLanding;

                this.dataSource = new MatTableDataSource(resp.rateParking);
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
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;

                    return this._parametricS.searchRateParking(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.rateParking);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    /* format date */
    formatDate(e: any) {
        var d = new Date(e.target.value);
        var convertDate = d.toISOString().substring(0, 10) + d.toISOString().substring(10,);
        this.RateParkingForm.get('startDate_yyyyMMdd')?.setValue(convertDate, { onlyself: true });
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                this.editRateParking(this.selectedRateParking);
                break;
            case 'eliminar':
                this.deleteRateParking(this.selectedRateParking);
                break;
            case 'tarifa':
                this.showLanding(this.selectedRateParking);
                break;
            case 'exportar':
                break;
        }
    }


    showLanding(rateParking: RateParking){
        this.rateLandingDialog = true;
        let rateLanding = this.filteredRateLanding.find(rate => rate.id === rateParking.tarifaAterrizajeId);
        this.dataSourceRL = new MatTableDataSource([rateLanding]);
    }

    hideLanding(){
        this.rateLandingDialog = false;
    }

    hideDialog() {
        this.rateParkingDialog = false;
        this.submitted = false;
    }

    saveRateSurcharge() {

        const rateParking = this.RateParkingForm.value;
        Object.keys(this.RateParkingForm.value).forEach(key => {
            if(!rateParking[key]){
                delete rateParking[key] ;
            }
        });

        this.submitted = true;
        if ( this.momento == 'nuevo' ) {

            this._parametricS.postRateParking(this.RateParkingForm.value).subscribe(
                (resp) => {

                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAllRateParking().subscribe(
                            (resp) => {

                                this.listRateLanding = resp.rateLanding;
                                this.dataSource = new MatTableDataSource(resp.rateParking);
                                this.loading = false;
                                this.pagination = resp.pagination;
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;
                                this._changeDetectorRef.markForCheck();
                            }
                        );

                        this.messageService.add({
                            severity: 'success',
                            summary: 'ESTIMADO USUARIO',
                            detail: `Tarifa de estacionamiento guardado exitosamente`,
                            life: 5000
                        });
                        this.RateParkingForm.reset();
                        this.hideDialog();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'ESTIMADO USUARIO',
                            detail: `${resp.resultError.message}`,
                            life: 10000
                        });
                    }
                }
            );

        }else if( this.momento == 'editar' ){

            this._parametricS.putRateParking(this.RateParkingForm.value).subscribe(
                (resp) => {
                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAllRateParking().subscribe(
                            (resp) => {

                                this.listRateLanding = resp.rateLanding;
                                this.dataSource = new MatTableDataSource(resp.rateParking);
                                this.loading = false;
                                this.pagination = resp.pagination;
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;
                                this._changeDetectorRef.markForCheck();
                            }
                        );

                        this.messageService.add({
                            severity: 'success',
                            summary: 'ESTIMADO USUARIO',
                            detail: `Tarifa de estacionamiento editado exitosamente`,
                            life: 5000
                        });
                        this.RateParkingForm.reset();
                        this.hideDialog();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'ESTIMADO USUARIO',
                            detail: `${resp.resultError.message}`,
                            life: 10000
                        });
                    }
                }
            );

        }

    }

    refreshRateSurcharge(){
        this._parametricS.getAllRateParking().subscribe(
            (resp) => {
                this.listRateLanding = resp.rateLanding;
                this.dataSource = new MatTableDataSource(resp.rateParking);
                this.loading = false;
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
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

    @Input() get selectedColumns(): any[] {
        this._changeDetectorRef.markForCheck();
        return this._selectedColumns;
    }

    set selectedColumns(val: any[]) {
        //restore original order
        this._selectedColumns = this.cols.filter(col => val.includes(col));
        this._changeDetectorRef.markForCheck();
    }

    openNew() {
        this.RateParkingForm.reset();
        this.rateParking = this.selectedRateParking = {};
        this.submitted = false;
        this.rateParkingDialog = true;
        this.momento = 'nuevo';
    }

    deleteAtoCategory() {
        this.deleteRateParkingDialog = true;
    }

    editRateParking(rateParking: RateParking) {
        this.filteredRateLanding = this.listRateLanding;
        this.RateParkingForm.patchValue(rateParking);
        this.rateParking = { ...rateParking };
        this.rateParkingDialog = true;
        this.momento = 'editar';
    }

    deleteRateParking(rateParking: RateParking) {
        this.deleteRateParkingDialog = true;
        this.rateParking = { ...rateParking };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteRateParkingDialog = false;
        this._parametricS.deleteRateParking(this.selectedRateParking.id).subscribe(
            (resp) => {
                if (!resp.hasError) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Tarifa de estacionamiento eliminada exitosamente.`,
                        life: 5000
                    });
                    this._parametricS.getAllRateParking().subscribe(
                        (resp) => {
                            this.listRateLanding = resp.rateLanding;
                            this.dataSource = new MatTableDataSource(resp.rateParking);
                            this.loading = false;
                            this.pagination = resp.pagination;
                            this.dataSource.paginator = this.paginator;
                            this.dataSource.sort = this.sort;
                            this._changeDetectorRef.markForCheck();
                        }
                    );
                }else{
                    this.messageService.add({
                        severity: 'error',
                        summary: 'ESTIMADO USUARIO',
                        detail: `${resp.resultError.message}`,
                        life: 10000
                    });
                }
            }
        );
    }

    /**
     * Filter Rate Landing
     *
     * @param query
     */
    searchRateLanding(query: string): void
    {

        // Reset the filtered courses
        this.filteredRateLanding = this.listRateLanding;
        // Filter by search query
        if ( query !== '' ) {
            this.filteredRateLanding = this.filteredRateLanding.filter(rate =>
                rate.rateLanding.toLowerCase().includes(query.toLowerCase())
                /*|| rate.entity.toLowerCase().includes(query.toLowerCase())
                || rate.currency.toLowerCase().includes(query.toLowerCase())
                || rate.country.toLowerCase().includes(query.toLowerCase())
                || rate.tarifa.toString().includes(query.toLowerCase())
                || rate.pesoMinimo.toString().includes(query.toLowerCase())
                || rate.pesoMaximo.toString().includes(query.toLowerCase())*/
            );
        }
    }

    /**
     * Get Rate Landing
     */
    getRateLanding(tarifaAterrizajeId: string) {
        if ( tarifaAterrizajeId !== null && tarifaAterrizajeId !== undefined && tarifaAterrizajeId !== '' ) {
            let filterRate = this.filteredRateLanding.find(rate => rate.id === tarifaAterrizajeId);
            return filterRate.rateLanding;//`${filterRate.servicio} ${filterRate.tarifa} ${filterRate.currency}`;
        }
    }

}

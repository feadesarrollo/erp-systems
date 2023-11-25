import {ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {RateLanding, RateParking, RateSurcharge} from "../parametrics.type";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService, MenuItem } from "primeng/api";
import { ParametricsService } from "../parametrics.service";
import { takeUntil, Subject, switchMap, map, debounceTime, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'lan-rate-landing',
    templateUrl: './rate-landing.component.html',
    styleUrls: ['./rate-landing.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RateLandingComponent implements OnInit {

    rateLanding: RateLanding = {};
    selectedRateLanding: RateLanding = {};

    cols: any[] = [];
    submitted: boolean = false;
    rateLandingDialog: boolean = false;
    deleteRateLandingDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','country','entity','categorie','nombreEstacion','codEstacion','servicio','tipoTrafico','pesoMinimo',
                        'pesoMaximo','tarifa','currency','startDate_yyyyMMdd','endDate_yyyyMMdd'];
    loading: boolean;

    momento: string = '';

    public RateLandingForm: FormGroup;

    public listCountry: any;
    public filteredCountry: any;
    public listEntity: any;
    public filteredEntity: any;
    public listCategoryAto: any;
    public filteredCategoryAto: any;
    public listCurrency: any;
    public filteredCurrency: any;

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };


    parkingSurchargeDialog: boolean = false;

    dataSourceP: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginatorP: MatPaginator;
    @ViewChild(MatSort) sortP: MatSort;
    paginationP: any = [];

    displayedColumnsP = [/*'accion',*/'tarifa','minSinCosto','hrsEstacionamiento','porcentaje','fromula',
        'startDate_yyyyMMdd','endDate_yyyyMMdd'];
    colsP = [
        { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
        { field: 'endDate_yyyyMMdd', header: 'Fecha Fin', width: 'min-w-32'},
        { field: 'minSinCosto', header: 'Min. Sin/Costo', width: 'min-w-32'},
        { field: 'hrsEstacionamiento', header: 'Horas Parqueo', width: 'min-w-32'},
        { field: 'porcentaje', header: 'Porcentaje', width: 'min-w-32'},
        { field: 'fromula', header: 'Formula', width: 'min-w-72'}
    ];

    selectedRateParking: RateParking = {};

    dataSourceS: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginatorS: MatPaginator;
    @ViewChild(MatSort) sortS: MatSort;
    paginationS: any = [];

    displayedColumnsS = [/*'accion',*/'tarifa','tarifaDomingo','tarifaFeriado','tarifaSemana','servicio','porcentaje','fromula',
        'startHr','endHr'];

    colsS = [
        { field: 'tarifaDomingo', header: 'Tarifa Domingo', width: 'min-w-32'},
        { field: 'tarifaFeriado', header: 'Tarifa Feriado', width: 'min-w-32'},
        { field: 'tarifaSemana', header: 'Tarifa Semana', width: 'min-w-32'},
        { field: 'servicio', header: 'Servicio', width: 'min-w-32'},
        { field: 'porcentaje', header: 'Porcentaje', width: 'min-w-32'},
        { field: 'fromula', header: 'Formula', width: 'min-w-72'},
        { field: 'startHr', header: 'Hora Inicio', width: 'min-w-32'},
        { field: 'endHr', header: 'Hora Fin', width: 'min-w-32'}
    ];
    selectedRateSurcharge: RateSurcharge = {};

    items: MenuItem[];

    constructor(
        private messageService: MessageService,
        private _parametricS: ParametricsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.items = [
            {label: 'Recargo', icon: 'pi pi-fw pi-home'},
            {label: 'Parqueo', icon: 'pi pi-fw pi-cog'}
        ];

        this.RateLandingForm = this._formBuilder.group({

            paisId: ['',[Validators.required]],
            entidadId: ['',[Validators.required]],
            categoriaAtoId: ['',[Validators.required]],
            servicio: ['',[Validators.required]],
            tipoTrafico: ['',[Validators.required]],
            pesoMinimo: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            pesoMaximo: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            tarifa: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            monedaId: ['',[Validators.required]],
            id: [''],
            startDate_yyyyMMdd: ['',[Validators.required]],
            endDate_yyyyMMdd: ['',[Validators.required]]
        });

        this.cols = [
            { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
            { field: 'endDate_yyyyMMdd', header: 'Fecha Fin', width: 'min-w-32'},

            { field: 'country', header: 'Pais', width: 'min-w-32'},
            { field: 'entity', header: 'Entidad', width: 'min-w-32'},
            { field: 'categorie', header: 'Categoria Ato', width: 'min-w-32'},
            { field: 'nombreEstacion', header: 'Nombre Ato', width: 'min-w-72'},
            { field: 'codEstacion', header: 'Codigo Ato', width: 'min-w-32'},
            { field: 'servicio', header: 'Servicio', width: 'min-w-32'},
            { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-44'},
            { field: 'pesoMinimo', header: 'Peso Minimo', width: 'min-w-32'},
            { field: 'pesoMaximo', header: 'Peso Maximo', width: 'min-w-32'},
            { field: 'tarifa', header: 'Tarifa', width: 'min-w-32'},
            { field: 'currency', header: 'Moneda', width: 'min-w-52'}

        ];

        this._selectedColumns = this.cols;

        this._parametricS.getMatchRateLanding().subscribe(
            (resp: any) => {
                this.listCurrency = resp.currency;
                this.listCategoryAto = resp.atoCategory;
                this.listCountry = resp.country;
                this.listEntity = resp.entity;

                this.dataSource = new MatTableDataSource(resp.rateLanding);
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
                    return this._parametricS.searchRateLanding(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.rateLanding);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                this.editRateLanding(this.selectedRateLanding);
                break;
            case 'eliminar':
                this.deleteRateLanding(this.selectedRateLanding);
                break;
            case 'tarifa':
                this.showParkingSurcharge(this.selectedRateLanding);
                break;
            case 'exportar':
                break;
        }
    }

    showParkingSurcharge(rateLanding: RateLanding){
        this.parkingSurchargeDialog = true;

        this._parametricS.getParkingSurcharge(rateLanding).subscribe(
            (resp: any) => {
                /************************************************ PARKING ************************************************/
                this.dataSourceP = new MatTableDataSource(resp.parkingLanding);
                this.paginatorP._intl.itemsPerPageLabel="Registros por pagina";
                this.paginatorP._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 de ${length }`;
                    }
                    length = Math.max(length, 0);
                    const startIndex = page * pageSize;
                    // If the start index exceeds the list length, do not try and fix the end index to the end.
                    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                    return `${startIndex + 1} - ${endIndex} de ${length}`;
                };
                this.paginatorP._intl.nextPageLabel = 'Página Siguiente';
                this.paginatorP._intl.firstPageLabel = 'Primera Página';
                this.paginatorP._intl.lastPageLabel = 'Ultima Página';
                this.paginatorP._intl.previousPageLabel = 'Página Anterior';
                this.paginationP = resp.paginationParking;
                this.dataSourceP.paginator = this.paginatorP;
                this.dataSourceP.sort = this.sortP;
                /************************************************ PARKING ************************************************/
                /************************************************ SURCHARGE ************************************************/
                this.dataSourceS = new MatTableDataSource(resp.surchargeLanding);
                this.paginatorS._intl.itemsPerPageLabel="Registros por pagina";
                this.paginatorS._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 de ${length }`;
                    }
                    length = Math.max(length, 0);
                    const startIndex = page * pageSize;
                    // If the start index exceeds the list length, do not try and fix the end index to the end.
                    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                    return `${startIndex + 1} - ${endIndex} de ${length}`;
                };
                this.paginatorS._intl.nextPageLabel = 'Página Siguiente';
                this.paginatorS._intl.firstPageLabel = 'Primera Página';
                this.paginatorS._intl.lastPageLabel = 'Ultima Página';
                this.paginatorS._intl.previousPageLabel = 'Página Anterior';
                this.paginationS = resp.paginationSurcharge;
                this.dataSourceS.paginator = this.paginatorS;
                this.dataSourceS.sort = this.sortS;
                /************************************************ SURCHARGE ************************************************/
            }
        );
    }

    hideParkingSurcharges(){
        this.parkingSurchargeDialog = false;
    }

    hideDialog() {
        this.rateLandingDialog = false;
        this.submitted = false;
    }

    saveRateLanding() {

        const rateLanding = this.RateLandingForm.value;
        Object.keys(this.RateLandingForm.value).forEach(key => {
            if(!rateLanding[key]){
                delete rateLanding[key] ;
            }
        });

        this.submitted = true;
        if ( this.momento == 'nuevo' ) {

            this._parametricS.postRateLanding(this.RateLandingForm.value).subscribe(
                (resp) => {

                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getMatchRateLanding().subscribe(
                            (resp) => {

                                this.listCurrency = resp.currency;
                                this.listCategoryAto = resp.atoCategory;
                                this.listCountry = resp.country;
                                this.listEntity = resp.entity;

                                this.dataSource = new MatTableDataSource(resp.rateLanding);
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
                            detail: `Tarifa de aterrizaje guardado Exitosamente`,
                            life: 5000
                        });
                        this.RateLandingForm.reset();
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

            this._parametricS.putRateLanding(this.RateLandingForm.value).subscribe(
                (resp) => {
                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getMatchRateLanding().subscribe(
                            (resp) => {

                                this.listCurrency = resp.currency;
                                this.listCategoryAto = resp.atoCategory;
                                this.listCountry = resp.country;
                                this.listEntity = resp.entity;

                                this.dataSource = new MatTableDataSource(resp.rateLanding);
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
                            detail: `Tarifa de aterrizaje editado Exitosamente`,
                            life: 5000
                        });
                        this.RateLandingForm.reset();
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

    refreshRateLanding(){
        this._parametricS.getMatchRateLanding().subscribe(
            (resp) => {

                this.listCurrency = resp.currency;
                this.listCategoryAto = resp.atoCategory;
                this.listCountry = resp.country;
                this.listEntity = resp.entity;

                this.dataSource = new MatTableDataSource(resp.rateLanding);
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
        this.RateLandingForm.reset();
        this.rateLanding = this.selectedRateLanding = {};
        this.submitted = false;
        this.rateLandingDialog = true;
        this.momento = 'nuevo';
    }

    deleteAtoCategory() {
        this.deleteRateLandingDialog = true;
    }

    editRateLanding(rateLanding: RateLanding) {
        this.filteredCountry = this.listCountry;
        this.filteredCurrency = this.listCurrency;
        this.filteredCategoryAto = this.listCategoryAto;
        this.filteredEntity = this.listEntity;

        this.RateLandingForm.patchValue(rateLanding);
        this.rateLanding = { ...rateLanding };
        this.rateLandingDialog = true;
        this.momento = 'editar';
    }

    deleteRateLanding(rateLanding: RateLanding) {
        this.deleteRateLandingDialog = true;
        this.rateLanding = { ...rateLanding };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteRateLandingDialog = false;
        this._parametricS.deleteRateLanding(this.selectedRateLanding.id).subscribe(
            (resp) => {
                if (!resp.hasError) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Tarifa de aterrizaje eliminada exitosamente.`,
                        life: 5000
                    });
                    this._parametricS.getMatchRateLanding().subscribe(
                        (resp) => {

                            this.listCurrency = resp.currency;
                            this.listCategoryAto = resp.atoCategory;
                            this.listCountry = resp.country;
                            this.listEntity = resp.entity;

                            this.dataSource = new MatTableDataSource(resp.rateLanding);
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
     * Filter Country
     *
     * @param query
     */
    searchCountry(query: string): void
    {

        // Reset the filtered courses
        this.filteredCountry = this.listCountry;
        // Filter by search query
        if ( query !== '' ) {
            this.filteredCountry = this.filteredCountry.filter(country => country.nombrePis.toLowerCase().includes(query.toLowerCase())
                || country.codPais.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Contry
     */
    getCountry(paisID: string) {
        if ( paisID !== null && paisID !== undefined && paisID !== '' )
            return this.filteredCountry.find(country => country.paisID === paisID).nombrePis;
    }

    /**
     * Filter Entity
     *
     * @param query
     */
    searchEntity(query: string): void
    {

        // Reset the filtered courses
        this.filteredEntity = this.listEntity;
        // Filter by search query
        if ( query !== '' ) {
            this.filteredEntity = this.filteredEntity.filter(entity => entity.entityName.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Entity
     */
    getEntity(entidadId: string) {

        if ( entidadId !== null && entidadId !== undefined && entidadId !== '' )
            return this.filteredEntity.find(entity => entity.id === entidadId).entityName;
    }

    /**
     * Filter Category Ato
     *
     * @param query
     */
    searchCategoryAto(query: string): void
    {

        // Reset the filtered courses
        this.filteredCategoryAto = this.listCategoryAto;
        // Filter by search query
        if ( query !== '' ) {
            this.filteredCategoryAto = this.filteredCategoryAto.filter(categoryAto => categoryAto.description.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Category Ato
     */
    getCategoryAto(categoriaAtoId: string) {
        if ( categoriaAtoId !== null && categoriaAtoId !== undefined && categoriaAtoId !== '' )
            return this.filteredCategoryAto.find(categoryAto => categoryAto.id === categoriaAtoId).description;
    }

    /**
     * Filter Currency
     *
     * @param query
     */
    searchCurrency(query: string): void
    {

        // Reset the filtered courses
        this.filteredCurrency = this.listCurrency;
        // Filter by search query
        if ( query !== '' ) {
            this.filteredCurrency = this.filteredCurrency.filter(currency => currency.nombre.toLowerCase().includes(query.toLowerCase())
                || currency.codigoIata.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Currency
     */
    getCurrency(monedaId: string) {
        if ( monedaId !== null && monedaId !== undefined && monedaId !== '' )
            return this.filteredCurrency.find(currency => currency.monedaID === monedaId).nombre;
    }

}

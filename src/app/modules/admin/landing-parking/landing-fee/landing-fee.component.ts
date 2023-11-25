import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Fee} from "../landing-parking.type";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {LandingParkingService} from "../landing-parking.service";

import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { BehaviorSubject } from "rxjs";
import * as moment from "moment";

@Component({
  selector: 'lan-landing-fee',
  templateUrl: './landing-fee.component.html',
    styleUrls: ['./landing-fee.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingFeeComponent implements OnInit {

    feeDialog: boolean = false;
    public FeeForm: FormGroup;

    fee: Fee = {};
    selectedFee: Fee = {};

    cols: any[] = [];
    submitted: boolean = false;

    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','ato','categoria','entidad','servicio','tipoTrafico','pesoMin','pesoMax','tarifa','nombre','prefijo'];
    loading: boolean;

    public filteredRateLanding: any;
    public listRateLanding: any;

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _lpService: LandingParkingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.FeeForm = this._formBuilder.group({
            date : ['',[Validators.required]],
            landingId : ['',[Validators.required]]
        });

        this.cols = [
            { field: 'ato', header: 'Aeropuerto', width: 'min-w-32'},
            { field: 'categoria', header: 'Categoria', width: 'min-w-32'},
            { field: 'entidad', header: 'Entidad', width: 'min-w-32'},
            { field: 'servicio', header: 'Servicio', width: 'min-w-32'},
            { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-32'},
            { field: 'pesoMin', header: 'Peso Min', width: 'min-w-32'},
            { field: 'pesoMax', header: 'Peso Max', width: 'min-w-32'},
            { field: 'tarifa', header: 'Tarifa', width: 'min-w-32'},
            { field: 'nombre', header: 'Nombre', width: 'min-w-32'},
            { field: 'prefijo', header: 'Prefijo', width: 'min-w-32'},

        ];

        this._selectedColumns = this.cols;

        this._lpService.getAllRateLanding().subscribe(
            (resp: any) => {

                this.listRateLanding = resp
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._lpService.searchFeeData(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.feeData);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    applyFilter() {

        this.fee = this.FeeForm.value;
        this.submitted = true;
        Object.keys(this.FeeForm.value).forEach(key => {
            if(!this.fee[key]){
                delete this.fee[key] ;
            }

            if( ['date'].includes(key) ){
                this.fee[key] = moment(this.fee[key]).format('YYYYMMDD');
            }
        });

        this._lpService.loadFeeData(this.fee).subscribe(
            (resp: any) => {
                let errorControl = resp.response;
                if (!errorControl.hasError) {
                    this.loading = true;

                    this.dataSource = new MatTableDataSource(resp.feeData);
                    this.loading = false;
                    this.pagination = resp.pagination;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();

                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Datos Cargados Exitosamente`,
                        life: 5000
                    });

                    this.hideDialog();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'ESTIMADO USUARIO',
                        detail: `${errorControl.resultError.message}`,
                        life: 10000
                    });
                }
            }
        );
    }

    openFilter() {
        this.submitted = false;
        this.feeDialog = true;
    }

    hideDialog() {
        this.feeDialog = false;
        this.submitted = false;
    }


    refreshFee(){
        this.fee = this.FeeForm.value;
        if( this.FeeForm.get('date').getRawValue() != '' && this.FeeForm.get('landingId').getRawValue() != '' ) {

            this._lpService.loadFeeData(this.fee).subscribe(
                (resp) => {
                    this.dataSource = new MatTableDataSource(resp.feeData);
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
                detail: `Debe definir criterio de filtrado`,
                life: 5000
            });
        }
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

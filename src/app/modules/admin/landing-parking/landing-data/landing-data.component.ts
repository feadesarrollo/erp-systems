import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Landing } from "../../landing-parking/landing-parking.type";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";

import { LandingParkingService } from "../landing-parking.service";

import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { BehaviorSubject } from "rxjs";
import * as moment from "moment";
import {RateParking} from "../../parametrics/parametrics.type";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {cloneDeep} from "lodash-es";
import {FileHistoryDialogComponent} from "./file-history-dialog/file-history-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {BobyConfirmationService} from "../../../../../@boby/services/confirmation";
import {ClosingDialogComponent} from "./closing-dialog/closing-dialog.component";
import {ActivatedRoute, Router} from "@angular/router";
import {BobyMockApiUtils} from "../../../../../@boby/lib/mock-api";

@Component({
    selector: 'lan-landing-data',
    templateUrl: './landing-data.component.html',
    styleUrls: ['./landing-data.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingDataComponent implements OnInit {

    landingDialog: boolean = false;
    consolidatedDialog: boolean = false;

    public LandingForm: FormGroup;

    landing: Landing = {};
    selectedLanding: Landing = {};

    landingDataDialog: boolean = false;

    submitted: boolean = false;

    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();

    public rangeDate: FormControl = new FormControl();
    public rangeList: any[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','estadoDes','matricula','mtow','atoOACILlegada','atoLlegada','rutaLlegada','tipoTrafico',
        'nroVueloLlegada','fechaAterrizaje','horaAterrizaje', 'fechaLlegadaProv','horaLlegadaProv','importeAterrizaje',
        'importeRecargoNocturno','importeRecargoDomingo','importeFeriado','importeTotalAterrizaje','obsAterrizaje','vueloId'];

    displayedColumnsCheck = cloneDeep(this.displayedColumns);
    listCheck: any;

    loading: boolean;

    public listAto: any;
    public filteredAto: any;

    public listAircraft: any;
    public filteredAircraft: any;

    /***************************************** RATE LANDING *****************************************/
    selectedLandingData: any = {};

    dataSourceLD: MatTableDataSource<any>;

    displayedColumnsLD =  ['accion','ato','categoria','entidad','servicio','tipoTrafico','pesoMin','pesoMax','tarifa','nombre','prefijo'];
    colsLD = [
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

    cols = [
        { field: 'estadoDes', header: 'Descripción Estado', width: 'min-w-44'},
        { field: 'matricula', header: 'Matricula', width: 'min-w-32'},
        { field: 'mtow', header: 'Peso', width: 'min-w-32'},
        { field: 'atoOACILlegada', header: 'Ato OACI Llegada', width: 'min-w-32'},
        { field: 'atoLlegada', header: 'Ato Llegada', width: 'min-w-32'},
        { field: 'rutaLlegada', header: 'Ruta Llegada', width: 'min-w-32'},
        { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-32'},
        { field: 'nroVueloLlegada', header: 'Numero de Vuelo', width: 'min-w-32'},
        { field: 'fechaAterrizaje', header: 'Fecha Aterrizaje (BOA)', width: 'min-w-40'},
        { field: 'horaAterrizaje', header: 'Hora Aterrizaje (BOA)', width: 'min-w-40'},
        { field: 'importeAterrizaje', header: 'Importe Aterrizaje', width: 'min-w-32'},
        { field: 'importeRecargoNocturno', header: 'Importe Recargo Nocturno', width: 'min-w-52'},
        { field: 'importeRecargoDomingo', header: 'Importe Recargo Domingo', width: 'min-w-52'},
        { field: 'importeFeriado', header: 'Importe Feriado', width: 'min-w-32'},
        { field: 'importeTotalAterrizaje', header: 'Importe Total Aterrizaje', width: 'min-w-52'},
        { field: 'fechaLlegadaProv', header: 'Fecha Llegada Prov', width: 'min-w-44'},
        { field: 'horaLlegadaProv', header: 'Hora Llegada Prov', width: 'min-w-44'},
        { field: 'obsAterrizaje', header: 'Observacion', width: 'min-w-80'},
        { field: 'vueloId', header: 'Vuelo ID', width: 'min-w-32'}
    ];

    public totalImporteAterrizaje:number = 0;
    public totalImporteFeriado:number = 0;
    public totalImporteRecargoDomingo:number = 0;
    public totalImporteRecargoNocturno:number = 0;
    public totalImporteTotalAterrizaje:number = 0;

    /**************** CONSOLIDADO ****************/
    public totalImporteEstacionamientos:number = 0;
    public totalVuelos:number = 0;
    public totalVuelosDiferencia:number = 0;
    public totalVuelosObservacion:number = 0;
    /**************** CONSOLIDADO ****************/

    /***************************************** RATE LANDING *****************************************/

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    now: any;
    disabled: any;
    start: any;
    endDate: any;

    configForm: FormGroup;
    landingData: any[];
    constructor(
        private messageService: MessageService,
        private _lpService: LandingParkingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _fcService: BobyConfirmationService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {

        //moment.locale('es-bo');
        this.now = moment().format("YYYY-MM-DD");
        console.warn('this.now', this.now);
        this.LandingForm = this._formBuilder.group({
            ato: [''],
            aircraft: [''],
            startDate: ['',[Validators.required]],
            endDate: ['',[Validators.required]]
        });



        let col;
        this.displayedColumnsCheck.shift();
        this.listCheck = this.displayedColumnsCheck.map( (item,index) => {
            col = this.cols.find(elem => elem.field == item);
            return {field : col.field,header : col.header, width : col.width, checked : true, order:index+1};
        });

        this._selectedColumns = this.cols;

        this._lpService.getAllAirports().subscribe(
            (resp: any) => {
                this.listAto = resp.result
            }
        );

        this._lpService.getAllAircraft().subscribe(
            (resp: any) => {
                this.listAircraft = resp.result
            }
        );

        this._lpService.getClosingDates().subscribe(
            (resp: any) => {
                this.rangeList = resp.datos
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._lpService.searchLandingData(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.landingData);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    dateChange(type, ev){ console.warn('dateChange', type, ev);
        this.disabled = this.start;
    }

    onStartChange(event: any) {
        console.log('change ', event.value);
        if (this.endDate) return;
        this.endDate = moment(event.value).endOf('month')//.format('YYYY-MM-DD');
        console.log('endDate ', this.endDate);
    }

    showConsolidated(){
        this.consolidatedDialog = true;
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

    executeCommand(valor: string){
        switch (valor) {
            case 'tarifa':
                this.showLanding(this.selectedLanding);
                break;
        }
    }

    showLanding(selectedLanding: any){
        this.landingDataDialog = true;
        this._lpService.loadFeeData({date: moment(selectedLanding.fechaAterrizaje).format('YYYYMMDD'), landingId: selectedLanding.tarifaAterrizajeId}).subscribe(
            (resp: any) => {
                console.warn('showLanding', resp);
                this.dataSourceLD = new MatTableDataSource(resp.feeData);
            }
        );
    }

    applyFilter() {

        this.landing = this.LandingForm.value;
        this.submitted = true;
        Object.keys(this.LandingForm.value).forEach(key => {
            if(!this.landing[key]){
                delete this.landing[key] ;
            }

            if( ['startDate', 'endDate'].includes(key) ){
                this.landing[key] = moment(this.landing[key]).format('YYYYMMDD');
            }
        });

        this._lpService.loadLandingData(this.landing).subscribe(
            (resp: any) => {
                let errorControl = resp.response;
                if (!errorControl.hasError) {
                    this.loading = true;
                    this.totalImporteAterrizaje = resp.landingData.map(lan => lan.importeAterrizaje).reduce((acc, value) => acc + value, 0);
                    this.totalImporteFeriado = resp.landingData.map(lan => lan.importeFeriado).reduce((acc, value) => acc + value, 0);
                    this.totalImporteRecargoDomingo = resp.landingData.map(lan => lan.importeRecargoDomingo).reduce((acc, value) => acc + value, 0);
                    this.totalImporteRecargoNocturno = resp.landingData.map(lan => lan.importeRecargoNocturno).reduce((acc, value) => acc + value, 0);
                    this.totalImporteTotalAterrizaje = resp.landingData.map(lan => lan.importeTotalAterrizaje).reduce((acc, value) => acc + value, 0);

                    this.totalVuelos = resp.landingData.length;
                    this.totalVuelosObservacion = resp.landingData.filter(flight => flight.obsAterrizaje != '').length;

                    this.dataSource = new MatTableDataSource(resp.landingData);
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
        this.landingDialog = true;
    }

    hideDialog() {
        this.landingDialog = false;
        this.submitted = false;
    }

    openFileHistory() {
        const dialogRef = this._matDialog.open(FileHistoryDialogComponent, {
            height: '80%',
            width: '70%',
            data: {}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }

    conciliationClosing() {
        const range = this.rangeList.find(range => range.start_date == moment(this.LandingForm.get('startDate').value).format('YYYY-MM-DD') && range.end_date == moment(this.LandingForm.get('endDate').value).format('YYYY-MM-DD'));
        console.warn('range',range);

        if ( range ){
            // Get the landing data
            this._lpService.landingData$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((value: any) => {
                    this.landingData = value;
                    // Mark for check
                    //this._changeDetectorRef.markForCheck();
                });

            this.router.navigate(['closing'], {relativeTo: this.route});
            const dialogRef = this._matDialog.open(ClosingDialogComponent, {
                data: {
                    list: this.landingData,
                    startDate: moment(this.LandingForm.get('startDate').value).format('DD/MM/YYYY'),
                    endDate: moment(this.LandingForm.get('endDate').value).format('DD/MM/YYYY'),
                    ato: this.LandingForm.get('ato').value,
                    aircraft: this.LandingForm.get('aircraft').value
                }
            });

            dialogRef.afterClosed().subscribe((result) => {
                this.router.navigate(['./'], {relativeTo: this.route});
            });
        }else {
            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `Estimado Usuario, esta seguro de confirmar el cierre?`,
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

                // Get the landing data
                this._lpService.landingData$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((value: any) => {
                        this.landingData = value;

                        // Mark for check
                        //this._changeDetectorRef.markForCheck();
                    });

                this._lpService.getClosingDates().subscribe(
                    (resp: any) => {
                        this.rangeList = resp.datos;
                        this._changeDetectorRef.markForCheck();
                    }
                );

                if (result == 'confirmed') {

                    this.router.navigate(['closing'], {relativeTo: this.route});
                    const dialogRef = this._matDialog.open(ClosingDialogComponent, {
                        data: {
                            list: this.landingData,
                            startDate: moment(this.LandingForm.get('startDate').value).format('DD/MM/YYYY'),
                            endDate: moment(this.LandingForm.get('endDate').value).format('DD/MM/YYYY'),
                            ato: this.LandingForm.get('ato').value,
                            aircraft: this.LandingForm.get('aircraft').value
                        }
                    });

                    dialogRef.afterClosed().subscribe((result) => {
                        this.router.navigate(['./'], {relativeTo: this.route});
                    });
                } else {

                }
            });
        }

    }

    refreshLanding(){
        this.landing = this.LandingForm.value;

        if( this.LandingForm.get('startDate').getRawValue() != '' && this.LandingForm.get('endDate').getRawValue() != '' ) {

            this._lpService.loadLandingData(this.landing).subscribe(
                (resp) => {
                    this.dataSource = new MatTableDataSource(resp.landingData);
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
     * Filter AirPort
     *
     * @param query
     */
    searchAirport(query: string): void
    {

        // Reset the filtered courses
        this.filteredAto = this.listAto;
        // Filter by search query
        if ( query !== '' )
        {
            this.filteredAto = this.filteredAto.filter(ato => ato.nombreEstacion.toLowerCase().includes(query.toLowerCase())
                || ato.codEstacion.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get AirPort
     */
    getAirPort(atoId: string) {
        if ( atoId !== null && atoId !== undefined && atoId !== '' ){
            let filterAto = this.filteredAto.find(ato => ato.codEstacion === atoId);

            return `(${filterAto.codEstacion}) ${filterAto.nombreEstacion}`;

        }

    }

    /**
     * Filter Aircraft
     *
     * @param query
     */
    searchAircraft(query: string): void
    {

        // Reset the filtered courses
        this.filteredAircraft = this.listAircraft;
        // Filter by search query
        if ( query !== '' )
        {
            this.filteredAircraft = this.filteredAircraft.filter(air => air.matricula.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Aircraft
     */
    getAircraft(aeronaveId: string) {
        if ( aeronaveId !== null && aeronaveId !== undefined && aeronaveId !== '' )
            return this.filteredAircraft.find(ato => ato.matricula === aeronaveId).matricula;
    }

    onYearChange(ev) {}
    onRangeChange(ev) {
        const range = this.rangeList.find(item => item.id_landing === ev);

        if (range.airport) this.searchAirport(range.airport);
        if (range.aircraft) this.searchAircraft(range.aircraft);

        this.LandingForm.get('ato').setValue(this.filteredAto[0].codEstacion);
        this.LandingForm.get('aircraft').setValue(this.filteredAircraft[0].matricula);
        this.LandingForm.get('startDate').setValue(range.start_date);
        this.LandingForm.get('endDate').setValue(range.end_date);
        this.applyFilter();
    }

    refreshRangeSelect(){
        this._lpService.getClosingDates().subscribe(
            (resp: any) => {
                this.rangeList = resp.datos
            }
        );
    }
    onDayChange(ev) {}
    onTypeChange(ev) {}
}

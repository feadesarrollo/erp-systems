import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Parking } from "../landing-parking.type";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { LandingParkingService } from "../landing-parking.service";

import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { BehaviorSubject } from "rxjs";
import * as moment from "moment";

import { MatCheckboxChange } from '@angular/material/checkbox';
import { cloneDeep } from 'lodash-es';

@Component({
    selector: 'lan-parking-data',
    templateUrl: './parking-data.component.html',
    styleUrls: ['./parking-data.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingDataComponent implements OnInit {

    parkingDialog: boolean = false;
    consolidatedDialog: boolean = false;

    public ParkingForm: FormGroup;

    parking: Parking = {};
    selectedParking: Parking = {};

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

    displayedColumns = ['accion','estadoDes','matricula','mtow','tipoTrafico','fechaAterrizaje','fechaLlegadaProv',
        'horaAterrizaje','horaLlegadaProv', 'nroVueloAterrizaje','fechaSalida','fechaSalidaProv','horaDespegueSalida','horaDespegueSalidaProv',
        'nroVueloSalida', 'atoLlegada','rutaLlegada','oaciProcedenciaProv','rutaSalida','oaciDestinoProv','minParqueo','minParqueoProv',
        'diferenciaMinParqueo','importeTotalAterrizaje','importeEstacionamientos','observacion','vueloId'];

    displayedColumnsCheck = cloneDeep(this.displayedColumns);
    listCheck: any;
    loading: boolean;

    public listAto: any;
    public filteredAto: any;

    public listAircraft: any;
    public filteredAircraft: any;

    /***************************************** RATE LANDING *****************************************/
    landingDataDialog: boolean = false;
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

    public totalImporteEstacionamientos:number = 0;
    public totalImporteTotalAterrizaje:number = 0;
    public totalVuelos:number = 0;
    public totalVuelosDiferencia:number = 0;
    public totalVuelosObservacion:number = 0;
    /***************************************** RATE LANDING *****************************************/

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _lpService: LandingParkingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.ParkingForm = this._formBuilder.group({
            ato: [''],
            aircraft: [''],
            startDate: ['',[Validators.required]],
            endDate: ['',[Validators.required]]
        });

        /*let displayedColumnsCheck = [
            {order:1,name:'estadoDes',show:true,desc: 'Descripción Estado'}, {order:2,name:'matricula',show:true, desc: 'Matricula'},
            {order:3,name:'mtow',show:true, desc: 'Peso'}, {order:4,name:'tipoTrafico',show:true, desc: 'Tipo Trafico'},
            {order:5,name:'fechaAterrizaje',show:true, desc: 'Fecha Aterrizaje(BOA)'}, {order:6,name:'fechaLlegadaProv',show:true, desc: ''},
            {order:7,name:'horaAterrizaje',show:true, desc: ''},{order:8,name:'horaLlegadaProv',show:true, desc: ''},
            {order:9,name:'nroVueloAterrizaje',show:true, desc: ''},{order:10,name:'fechaSalida',show:true, desc: ''},
            {order:11,name:'fechaSalidaProv',show:true, desc: ''}, {order:12,name:'horaDespegueSalida',show:true, desc: ''},
            {order:13,name:'horaDespegueSalidaProv',show:true, desc: ''},{order:14,name:'nroVueloSalida',show:true, desc: ''},
            {order:15,name:'atoLlegada',show:true, desc: ''},{order:16,name:'rutaLlegada',show:true, desc: ''},
            {order:17,name:'oaciProcedenciaProv',show:true, desc: ''}, {order:18,name:'rutaSalida',show:true, desc: ''},
            {order:19,name:'oaciDestinoProv',show:true, desc: ''},{order:20,name:'minParqueo',show:true, desc: ''},
            {order:21,name:'minParqueoProv',show:true, desc: ''},{order:22,name:'diferenciaMinParqueo',show:true, desc: ''},
            {order:23,name:'importeTotalAterrizaje',show:true, desc: ''}, {order:24,name:'importeEstacionamientos',show:true, desc: ''},
            {order:25,name:'observacion',show:true, desc: ''},{order:26,name:'vueloId',show:true, desc: ''}
        ];*/

        this.cols = [
            { field: 'estadoDes', header: 'Descripción Estado', width: 'min-w-44'},
            { field: 'matricula', header: 'Matricula', width: 'min-w-32'},
            { field: 'mtow', header: 'Peso', width: 'min-w-32'},
            { field: 'atoLlegada', header: 'Ato Llegada', width: 'min-w-32'},
            { field: 'rutaLlegada', header: 'Ruta Llegada', width: 'min-w-32'},
            { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-32'},
            { field: 'fechaAterrizaje', header: 'Fecha Aterrizaje(BOA)', width: 'min-w-40'},
            { field: 'horaAterrizaje', header: 'Hora Aterrizaje(BOA)', width: 'min-w-40'},
            { field: 'nroVueloAterrizaje', header: 'Nro Vuelo Aterrizaje', width: 'min-w-44'},
            { field: 'rutaSalida', header: 'Ruta Salida', width: 'min-w-32'},
            { field: 'fechaSalida', header: 'Fecha Salida(BOA)', width: 'min-w-36'},
            { field: 'horaDespegueSalida', header: 'Hora Despegue Salida(BOA)', width: 'min-w-48'},
            { field: 'nroVueloSalida', header: 'Nro Vuelo Salida', width: 'min-w-32'},
            { field: 'minParqueo', header: 'Minutos Parqueo(BOA)', width: 'min-w-40'},
            { field: 'oaciProcedenciaProv', header: 'Oaci Procedencia Prov', width: 'min-w-44'},
            { field: 'fechaLlegadaProv', header: 'Fecha Llegada Prov', width: 'min-w-44'},
            { field: 'horaLlegadaProv', header: 'Hora Llegada Prov', width: 'min-w-44'},
            { field: 'oaciDestinoProv', header: 'Oaci Destino Prov', width: 'min-w-32'},
            { field: 'fechaSalidaProv', header: 'Fecha Salida Prov', width: 'min-w-32'},
            { field: 'horaDespegueSalidaProv', header: 'Hora Despegue Salida Prov', width: 'min-w-52'},
            { field: 'minParqueoProv', header: 'Minutos Parqueo Prov', width: 'min-w-40'},
            { field: 'diferenciaMinParqueo', header: 'Diferencia Minutos Parqueo', width: 'min-w-48'},
            { field: 'importeTotalAterrizaje', header: 'Importe Total Aterrizaje(BOA)', width: 'min-w-48'},
            { field: 'importeEstacionamientos', header: 'Importe Estacionamientos(BOA)', width: 'min-w-52'},
            { field: 'observacion', header: 'Observacion', width: 'min-w-80'},
            { field: 'vueloId', header: 'Vuelo ID', width: 'min-w-32'}
        ];

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

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._lpService.searchParkingData(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.parkingData);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
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
                this.showLanding(this.selectedParking);
                break;
            case 'consolidado':
                this.showConsolidated();
                break;
        }
    }

    showLanding(selectedLanding: any){
        this.landingDataDialog = true;
        this._lpService.loadFeeData({date: moment(selectedLanding.fechaAterrizaje).format('YYYYMMDD'), landingId: selectedLanding.tarifaAterrizajeId}).subscribe(
            (resp: any) => {
                this.dataSourceLD = new MatTableDataSource(resp.feeData);
            }
        );
    }

    showConsolidated(){
        this.consolidatedDialog = true;
    }

    applyFilter() {

        this.parking = this.ParkingForm.value;
        this.submitted = true;

        Object.keys(this.ParkingForm.value).forEach(key => {
            if(!this.parking[key]){
                delete this.parking[key] ;
            }

            if( ['startDate', 'endDate'].includes(key) ){
                this.parking[key] = moment(this.parking[key]).format('YYYYMMDD');
            }
        });
        console.warn('applyFilter', this.parking);
        this._lpService.loadParkingData(this.parking).subscribe(
            (resp: any) => {
                let errorControl = resp.response;
                if (!errorControl.hasError) {
                    this.loading = true;

                    this.totalImporteEstacionamientos = resp.parkingData.map(lan => lan.importeEstacionamientos).reduce((acc, value) => acc + value, 0);
                    this.totalImporteTotalAterrizaje = resp.parkingData.map(lan => lan.importeTotalAterrizaje).reduce((acc, value) => acc + value, 0);
                    this.totalVuelos = resp.parkingData.length;

                    this.totalVuelosDiferencia = resp.parkingData.filter(flight => flight.diferenciaMinParqueo != 0).length;
                    this.totalVuelosObservacion = resp.parkingData.filter(flight => flight.observacion != '').length;

                    this.dataSource = new MatTableDataSource(resp.parkingData);
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
        this.parkingDialog = true;
    }

    hideDialog() {
        this.parkingDialog = false;
        this.submitted = false;
    }


    refreshParking(){
        this.parking = this.ParkingForm.value;

        if( this.ParkingForm.get('startDate').getRawValue() != '' && this.ParkingForm.get('endDate').getRawValue() != '' ) {

            this._lpService.loadParkingData(this.parking).subscribe(
                (resp) => {
                    this.dataSource = new MatTableDataSource(resp.parkingData);
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
            return `${filterAto.codEstacion}`;

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

}

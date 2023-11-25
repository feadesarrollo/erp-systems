import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AircraftWeight } from "../parametrics.type";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { ParametricsService } from "../parametrics.service";
import { takeUntil, Subject, switchMap, map, debounceTime, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'lan-aircraft-weight',
    templateUrl: './aircraft-weight.component.html',
    styleUrls: ['./aircraft-weight.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AircraftWeightComponent implements OnInit {

    aircraftWeight: AircraftWeight = {};
    selectedAircraftWeight: AircraftWeight = {};
    aircraftWeights: AircraftWeight[] = [];
    selectedAircraftWeights: AircraftWeight[] = [];

    cols: any[] = [];
    submitted: boolean = false;
    aircraftWeightDialog: boolean = false;
    deleteAircraftWeightDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','aircraft','modelo','mtow','startDate_yyyyMMdd','estado','usrRegistro'];
    loading: boolean;

    momento: string = '';

    public AircraftWeightForm: FormGroup;
    public listAircraft: any;
    public filteredAircraft: any;

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _parametricS: ParametricsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.AircraftWeightForm = this._formBuilder.group({
            id: [''],
            startDate_yyyyMMdd: [''],
            aeronaveId: ['',[Validators.required]],
            mtow: ['',[Validators.required, Validators.pattern("^-?\\d*[.,]?\\d{0,2}$")]],
            estado: [{value: '', disabled: true}],
            usrRegistro: [{value: '', disabled: true}]
        });

        this.cols = [
            { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
            { field: 'aircraft', header: 'Aeronave', width: 'min-w-32'},
            { field: 'modelo', header: 'Modelo', width: 'min-w-32'},
            { field: 'mtow', header: 'Peso', width: 'min-w-32'},
            { field: 'estado', header: 'Estado', width: 'min-w-32'},
            { field: 'usrRegistro', header: 'Usuario Reg.', width: 'min-w-72'}
        ];
        this._selectedColumns = this.cols;

        this._parametricS.getAircraftWeight().subscribe(
            (response) => {
                this.listAircraft = response.airCraft;

                this.dataSource = new MatTableDataSource(response.aircraftWeight);
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
                this.pagination = response.pagination;
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
                    return this._parametricS.searchAircraftWeight(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.aircraftWeight);
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
                this.editAircraftWeight(this.selectedAircraftWeight);
                break;
            case 'eliminar':
                this.deleteAircraftWeight(this.selectedAircraftWeight);
                break;
            case 'exportar':
                break;
        }
    }

    hideDialog() {
        this.aircraftWeightDialog = false;
        this.submitted = false;
    }

    saveAircraftWeight() {

        const aircraftWeight = this.AircraftWeightForm.value;
        Object.keys(this.AircraftWeightForm.value).forEach(key => {
            if(!aircraftWeight[key]){
                delete aircraftWeight[key] ;
            }
        });

        this.submitted = true;
        if ( this.momento == 'nuevo' ) {

            this._parametricS.postAircraftWeight(this.AircraftWeightForm.value).subscribe(
                (resp) => {

                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAircraftWeight().subscribe(
                            (resp) => {

                                resp.aircraftWeight.forEach(aircraftWeight =>{
                                    let aircraft = this.listAircraft.find(item => item.aeronaveid == aircraftWeight.aeronaveId);
                                    aircraftWeight.aircraft = aircraft.matricula;
                                });

                                this.dataSource = new MatTableDataSource(resp.aircraftWeight);
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
                            detail: `Peso Aeronave  ${this.AircraftWeightForm.value.mtow} guardado Exitosamente`,
                            life: 5000
                        });
                        this.AircraftWeightForm.reset();
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

            this._parametricS.putAircraftWeight(this.AircraftWeightForm.value).subscribe(
                (resp) => {
                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAircraftWeight().subscribe(
                            (resp) => {
                                resp.aircraftWeight.forEach(aircraftWeight =>{
                                    let aircraft = this.listAircraft.find(item => item.aeronaveid == aircraftWeight.aeronaveId);
                                    aircraftWeight.aircraft = aircraft.matricula;
                                });

                                this.dataSource = new MatTableDataSource(resp.aircraftWeight);
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
                            detail: `Peso Aeronave  ${this.selectedAircraftWeight.mtow} editado Exitosamente`,
                            life: 5000
                        });
                        this.AircraftWeightForm.reset();
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

    refreshAircraftWeight(){
        this._parametricS.getAircraftWeight().subscribe(
            (resp) => {

                resp.aircraftWeight.forEach(aircraftWeight =>{
                    let aircraft = this.listAircraft.find(item => item.aeronaveid == aircraftWeight.aeronaveId);
                    aircraftWeight.aircraft = aircraft.matricula;
                });

                this.dataSource = new MatTableDataSource(resp.aircraftWeight);
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
        this.AircraftWeightForm.reset();

        let user = JSON.parse(localStorage.getItem('aut')).nombre_usuario;
        this.AircraftWeightForm.get('estado').setValue(1);
        this.AircraftWeightForm.get('usrRegistro').setValue(user);
        this.aircraftWeight = this.selectedAircraftWeight = {};
        this.submitted = false;
        this.aircraftWeightDialog = true;
        this.momento = 'nuevo';
    }

    deleteAtoCategory() {
        this.deleteAircraftWeightDialog = true;
    }

    editAircraftWeight(aircraftWeight: AircraftWeight) {
        this.filteredAircraft = this.listAircraft;
        this.AircraftWeightForm.patchValue(aircraftWeight);
        this.aircraftWeight = { ...aircraftWeight };
        this.aircraftWeightDialog = true;
        this.momento = 'editar';
    }

    deleteAircraftWeight(aircraftWeight: AircraftWeight) {
        this.deleteAircraftWeightDialog = true;
        this.aircraftWeight = { ...aircraftWeight };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteAircraftWeightDialog = false;
        this._parametricS.deleteAircraftWeight(this.selectedAircraftWeight.id).subscribe(
            (resp) => {
                if (!resp.hasError) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Peso Aeronave ${this.selectedAircraftWeight.mtow} eliminada exitosamente.`,
                        life: 5000
                    });
                    this._parametricS.getAircraftWeight().subscribe(
                        (resp) => {

                            resp.aircraftWeight.forEach(aircraftWeight =>{
                                let aircraft = this.listAircraft.find(item => item.aeronaveid == aircraftWeight.aeronaveId);
                                aircraftWeight.aircraft = aircraft.matricula;
                            });

                            this.dataSource = new MatTableDataSource(resp.aircraftWeight);
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
            return this.filteredAircraft.find(ato => ato.aeronaveid === aeronaveId).matricula;
    }

}

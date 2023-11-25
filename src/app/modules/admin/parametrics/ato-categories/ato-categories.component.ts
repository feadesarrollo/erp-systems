import {ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { AtoCategorie } from "../parametrics.type";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {ParametricsService} from "../parametrics.service";
import { takeUntil, Subject, switchMap, map, debounceTime, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'lan-ato-categories',
    templateUrl: './ato-categories.component.html',
    styleUrls: ['./ato-categories.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AtoCategoriesComponent implements OnInit {

    atoCategory: AtoCategorie = {};
    selectedAtoCategory: AtoCategorie = {};
    entities: AtoCategorie[] = [];

    cols: any[] = [];
    submitted: boolean = false;
    atoCategoryDialog: boolean = false;
    deleteAtoCategoryDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','categorie','airPort','codEstacion','startDate_yyyyMMdd','endDate_yyyyMMdd'];
    loading: boolean;

    momento: string = '';

    public AtoCategoryForm: FormGroup;
    public listAirPort: any;
    public filteredAirPort: any;

    private _listaPai$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _parametricS: ParametricsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.AtoCategoryForm = this._formBuilder.group({
            id: [''],
            categorie: ['',[Validators.required]],
            atoId: ['',[Validators.required]],
            startDate_yyyyMMdd: ['',[Validators.required]],
            endDate_yyyyMMdd: ['',[Validators.required]]
        });

        this.cols = [
            { field: 'categorie', header: 'Categoria', width: 'min-w-32'},
            { field: 'airPort', header: 'Aeropuerto', width: 'min-w-80'},
            { field: 'codEstacion', header: 'Cod. Aeropuerto', width: 'min-w-77'},
            { field: 'startDate_yyyyMMdd', header: 'Fecha Inicio', width: 'min-w-32'},
            { field: 'endDate_yyyyMMdd', header: 'Fecha Fin', width: 'min-w-32'}
        ];
        this._selectedColumns = this.cols;

        this._parametricS.getAtoCategories().subscribe(
            (response) => {

                this.listAirPort = response.airports;

                this.dataSource = new MatTableDataSource(response.atoCategories);
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
                    return this._parametricS.searchAtoCategories(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.atoCategories);
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
                this.editAtoCategorie(this.selectedAtoCategory);
                break;
            case 'eliminar':
                this.deleteAtoCategorie(this.selectedAtoCategory);
                break;
            case 'exportar':
                break;
        }
    }

    hideDialog() {
        this.atoCategoryDialog = false;
        this.submitted = false;
    }

    saveAtoCategory() {

        const atoCategory = this.AtoCategoryForm.value;
        Object.keys(this.AtoCategoryForm.value).forEach(key => {
            if(!atoCategory[key]){
                delete atoCategory[key] ;
            }
        });

        this.submitted = true;
        if ( this.momento == 'nuevo' ) {

            this._parametricS.postAtoCategory(this.AtoCategoryForm.value).subscribe(
                (resp) => {

                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAtoCategories().subscribe(
                            (resp) => {

                                resp.atoCategories.forEach(atoCategory =>{
                                    let country = this.listAirPort.find(item => item.aeropuertoID == atoCategory.atoId);
                                    atoCategory.airPort = country.nombreEstacion;
                                });

                                this.dataSource = new MatTableDataSource(resp.atoCategories);
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
                            detail: `Categoria Ato  ${this.AtoCategoryForm.value.entityName} guardado Exitosamente`,
                            life: 5000
                        });
                        this.AtoCategoryForm.reset();
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

            this._parametricS.putAtoCategory(this.AtoCategoryForm.value).subscribe(
                (resp) => {
                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getAtoCategories().subscribe(
                            (resp) => {
                                resp.atoCategories.forEach(atoCategory =>{
                                    let country = this.listAirPort.find(item => item.aeropuertoID == atoCategory.atoId);
                                    atoCategory.airPort = country.nombreEstacion;
                                });

                                this.dataSource = new MatTableDataSource(resp.atoCategories);
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
                            detail: `Categoria Ato  ${this.selectedAtoCategory.categorie} editado Exitosamente`,
                            life: 5000
                        });
                        this.AtoCategoryForm.reset();
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

    refreshAtoCategorie(){
        this._parametricS.getAtoCategories().subscribe(
            (resp) => {

                resp.atoCategories.forEach(atoCategory =>{
                    let country = this.listAirPort.find(item => item.aeropuertoID == atoCategory.atoId);
                    atoCategory.airPort = country.nombreEstacion;
                });

                this.dataSource = new MatTableDataSource(resp.atoCategories);
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
        this.AtoCategoryForm.reset();
        this.atoCategory = this.selectedAtoCategory = {};
        this.submitted = false;
        this.atoCategoryDialog = true;
        this.momento = 'nuevo';
    }

    deleteAtoCategory() {
        this.deleteAtoCategoryDialog = true;
    }

    editAtoCategorie(atoCategory: AtoCategorie) {
        this.filteredAirPort = this.listAirPort;
        this.AtoCategoryForm.patchValue(atoCategory);
        this.atoCategory = { ...atoCategory };
        this.atoCategoryDialog = true;
        this.momento = 'editar';
    }

    deleteAtoCategorie(atoCategory: AtoCategorie) {
        this.deleteAtoCategoryDialog = true;
        this.atoCategory = { ...atoCategory };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteAtoCategoryDialog = false;
        this._parametricS.deleteAtoCategory(this.selectedAtoCategory.id).subscribe(
            (resp) => {
                if (!resp.hasError) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Catogoria Ato ${this.selectedAtoCategory.categorie} eliminada exitosamente.`,
                        life: 5000
                    });
                    this._parametricS.getAtoCategories().subscribe(
                        (resp) => {

                            resp.atoCategories.forEach(atoCategory =>{
                                let country = this.listAirPort.find(item => item.aeropuertoID == atoCategory.atoId);
                                atoCategory.airPort = country.nombreEstacion;
                            });

                            this.dataSource = new MatTableDataSource(resp.atoCategories);
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
     * Filter por pais
     *
     * @param query
     */
    searchAirport(query: string): void
    {

        // Reset the filtered courses
        this.filteredAirPort = this.listAirPort;
        // Filter by search query
        if ( query !== '' )
        {
            this.filteredAirPort = this.filteredAirPort.filter(ato => ato.nombreEstacion.toLowerCase().includes(query.toLowerCase())
                || ato.codEstacion.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get airport
     */
    getAirPort(atoId: string) {
        if ( atoId !== null && atoId !== undefined && atoId !== '' )
            return this.filteredAirPort.find(ato => ato.aeropuertoID === atoId).nombreEstacion;
    }

}

import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Entity } from "../parametrics.type";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { ParametricsService } from "../parametrics.service";
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, combineLatest } from "rxjs";

import * as moment from 'moment';

@Component({
    selector: 'lan-entity',
    templateUrl: './entity.component.html',
    styleUrls: ['./entity.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EntityComponent implements OnInit {

    entity: Entity = {};
    selectedEntity: Entity = {};
    entities: Entity[] = [];
    selectedEntities: Entity[] = [];

    cols: any[] = [];
    submitted: boolean = false;
    entityDialog: boolean = false;
    deleteEntityDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','entityName','country'];
    loading: boolean;

    momento: string = '';

    public EntityForm: FormGroup;
    public listaPais: any;
    public filteredPais: any;

    private _listaPai$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    filters: { query$: BehaviorSubject<string>; } = { query$: new BehaviorSubject('') };

    constructor(
        private messageService: MessageService,
        private _parametricS: ParametricsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {

        this.EntityForm = this._formBuilder.group({
            id: [''],
            countryId: ['',[Validators.required]],
            entityName: ['',[Validators.required]]
        });

        this.cols = [
            { field: 'entityName', header: 'Nombre Entidad', width: 'min-w-32'},
            { field: 'country', header: 'Pais', width: 'min-w-32'}
        ];
        this._selectedColumns = this.cols;



        this._parametricS.getEntities().subscribe(
            (response) => {
                this._parametricS.getAllContries().subscribe(
                    (resp: any) => {
                        if (!resp.hasError){

                            this.listaPais = resp.result;

                            response.entities.forEach(entity =>{
                                let country = this.listaPais.find(item => item.paisID == entity.countryId);
                                entity.country = country.nombrePis;
                            });

                            this.dataSource = new MatTableDataSource(response.entities);
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

                        }else{
                            this.messageService.add({ severity: 'error', summary: 'ESTIMADO USUARIO', detail: `${resp.resultError.message}`, life: 10000 });
                        }

                    }
                );

                /*this.dataSource = new MatTableDataSource(resp.entities);
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
                this.dataSource.sort = this.sort;*/
            }
        );

        /*this._parametricS.getAllContries().subscribe(
            (resp: any) => {
                console.warn('GetAllContries', resp);
                if (!resp.hasError){
                    //this._listaPai$.next(resp.result) ;
                    this.listaPais = resp.result;
                }else{
                    this.messageService.add({ severity: 'error', summary: 'ESTIMADO USUARIO', detail: `${resp.resultError.message}`, life: 10000 });
                }

            }
        );*/

        // Filter the courses
        /*combineLatest([this.filters.query$])
            .subscribe(([query]) => {

                // Reset the filtered courses
                this.filteredPais = this.listaPais;



                // Filter by search query
                if ( query !== '' )
                {
                    this.filteredPais = this.filteredPais.filter(pais => pais.nombrePis.toLowerCase().includes(query.toLowerCase())
                        || pais.codPais.toLowerCase().includes(query.toLowerCase()));
                }

            });*/

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._parametricS.searchEntities(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.entities);
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
                this.editEntity(this.selectedEntity);
                break;
            case 'eliminar':
                this.deleteEntity(this.selectedEntity);
                break;
            case 'exportar':
                break;
        }
    }

    hideDialog() {
        this.entityDialog = false;
        this.submitted = false;
    }

    saveEntity() {

        const entity = this.EntityForm.value;
        Object.keys(this.EntityForm.value).forEach(key => {
            if(!entity[key]){
                delete entity[key] ;
            }
        });


        this.submitted = true;
        if ( this.momento == 'nuevo' ) {

            this._parametricS.postEntity(this.EntityForm.value).subscribe(
                (resp) => {

                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getEntities().subscribe(
                            (resp) => {

                                resp.entities.forEach(entity =>{
                                    let country = this.listaPais.find(item => item.paisID == entity.countryId);
                                    entity.country = country.nombrePis;
                                });
                                this.dataSource = new MatTableDataSource(resp.entities);
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
                            detail: `Entidad  ${this.EntityForm.value.entityName} guardado Exitosamente`,
                            life: 5000
                        });
                        this.EntityForm.reset();
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

            this._parametricS.putEntity(this.EntityForm.value).subscribe(
                (resp) => {
                    if (!resp.hasError) {
                        this.loading = true;
                        this._parametricS.getEntities().subscribe(
                            (resp) => {
                                resp.entities.forEach(entity =>{
                                    let country = this.listaPais.find(item => item.paisID == entity.countryId);
                                    entity.country = country.nombrePis;
                                });

                                this.dataSource = new MatTableDataSource(resp.entities);
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
                            detail: `Entidad  ${this.selectedEntity.entityName} editado Exitosamente`,
                            life: 5000
                        });
                        this.EntityForm.reset();
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

    refreshEntity(){
        this._parametricS.getEntities().subscribe(
            (resp) => {
                resp.entities.forEach(entity =>{
                    let country = this.listaPais.find(item => item.paisID == entity.countryId);
                    entity.country = country.nombrePis;
                });

                this.dataSource = new MatTableDataSource(resp.entities);
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
        this.EntityForm.reset();
        this.entity = this.selectedEntity = {};
        this.submitted = false;
        this.entityDialog = true;
        this.momento = 'nuevo';
    }

    deleteSelectedMedios() {
        this.deleteEntityDialog = true;
    }

    editEntity(entity: Entity) {
        this.filteredPais = this.listaPais;
        this.EntityForm.patchValue(entity);
        this.entity = { ...entity };
        this.entityDialog = true;
        this.momento = 'editar';
    }

    deleteEntity(entity: Entity) {
        this.deleteEntityDialog = true;
        this.entity = { ...entity };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteEntityDialog = false;
        this._parametricS.deleteEntity(this.selectedEntity.id).subscribe(
            (resp) => {
                if (!resp.hasError) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'ESTIMADO USUARIO',
                        detail: `Entidad ${this.selectedEntity.entityName} eliminada exitosamente.`,
                        life: 5000
                    });
                    this._parametricS.getEntities().subscribe(
                        (resp) => {

                            resp.entities.forEach(entity => {
                                let country = this.listaPais.find(item => item.paisID == entity.countryId);
                                entity.country = country.nombrePis;
                            });

                            this.dataSource = new MatTableDataSource(resp.entities);
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
    searchLugar(query: string): void
    {
        // Reset the filtered courses
        this.filteredPais = this.listaPais;

        // Filter by search query
        if ( query !== '' )
        {
            this.filteredPais = this.filteredPais.filter(pais => pais.nombrePis.toLowerCase().includes(query.toLowerCase())
                || pais.codPais.toLowerCase().includes(query.toLowerCase()));
        }
    }

    /**
     * Get Pais
     */
    getPais(paisID: string) {
        if ( paisID !== null && paisID !== undefined && paisID !== '' )
            return this.filteredPais.find(pais => pais.paisID === paisID).nombrePis;
    }

}

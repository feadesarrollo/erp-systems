import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { SettingsService } from '../settings.service';
import { Compensation } from "../settings.type";

import { takeUntil, Subject, merge, switchMap, map, Observable, debounceTime } from 'rxjs';
import { CompensationDialogComponent } from "../compensation/compensation-dialog/compensation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'erp-compensation',
    templateUrl: './compensation.component.html'
})
export class CompensationComponent implements OnInit {

    compensacion: Compensation = {};
    selectedCompensacion: Compensation = {};
    compensaciones: Compensation[] = [];
    cols: any[] = [];
    selectedCompensaciones: Compensation[] = [];
    submitted: boolean = false;
    compensacionDialog: boolean = false;
    deleteCompensacionDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','codigo', 'nombre', 'orden', 'estado_reg', 'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'];
    loading: boolean;

    momento: string = '';

    constructor(
        private messageService: MessageService,
        private _configuracioneS: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.cols = [
            { field: 'codigo', header: 'Codigo', width: 'min-w-40'},
            { field: 'nombre', header: 'Compensación', width: 'min-w-72'},
            { field: 'orden', header: 'Orden', width: 'min-w-20'},
            { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-32',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._configuracioneS.getCompensacion().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.compensaciones);
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
                    return this._configuracioneS.searchCompensacion(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.compensaciones);
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
                this.showEditCompesationDialog(this.selectedCompensacion);
                break;
            case 'eliminar':
                this.deleteCompensacion(this.selectedCompensacion);
                break;
            case 'exportar':
                break;
        }
    }

    /**
     * Show dialog compensation form
     */
    showNewCompensationDialog(){

        this.compensacion = this.selectedCompensacion = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(CompensationDialogComponent,{
            height: '70%',
            width: '50%',
            data: {
                momento: this.momento
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Compensación ${result.nombre}  Guardado`,
                        life: 6000
                    });
                    this.refreshCompensacion();
                }
            });

    }

    showEditCompesationDialog(compensacion: Compensation) {
        this.compensacion = { ...compensacion };
        this.momento = 'editar';

        const dialogRef = this._matDialog.open(CompensationDialogComponent,{
            height: '70%',
            width: '50%',
            data: {compensacion: compensacion, momento: this.momento}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                /*if ( result != undefined ) {*/
                    this.messageService.add({severity: 'success', summary: 'Exito', detail: `Compensacion ${result.nombre} Modificado`, life: 6000});
                    this.refreshCompensacion();
                //}
            });
    }

    hideDialog() {
        this.compensacionDialog = false;
        this.submitted = false;
    }



    refreshCompensacion(){
        this._configuracioneS.getCompensacion().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.compensaciones);
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
        this.compensacion = this.selectedCompensacion = {};
        this.submitted = false;
        this.compensacionDialog = true;
        this.momento = 'nuevo';
    }

    deleteSelectedMedios() {
        this.deleteCompensacionDialog = true;
    }

    editCompensacion(compen: Compensation) {
        this.compensacion = { ...compen };
        this.compensacionDialog = true;
        this.momento = 'editar';
    }

    deleteCompensacion(compen: Compensation) {
        this.deleteCompensacionDialog = true;
        this.compensacion = { ...compen };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteCompensacionDialog = false;
        this._configuracioneS.deleteCompensacion(this.selectedCompensacion.id_compensacion).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Compensación ${this.selectedCompensacion.nombre} Eliminado`, life: 3000 });
                this._configuracioneS.getCompensacion().subscribe(
                    (resp) => {
                        this.dataSource = new MatTableDataSource(resp.compensaciones);
                        this.loading = false;
                        this.pagination = resp.pagination;
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                        this._changeDetectorRef.markForCheck();
                    }
                );
            }
        );
    }

}

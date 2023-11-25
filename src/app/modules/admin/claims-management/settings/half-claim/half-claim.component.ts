import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HalfClaim } from '../settings.type';
import { Table } from 'primeng/table';
import { SettingsService } from "../settings.service";

import { takeUntil, Subject, merge, switchMap, map, Observable, debounceTime } from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, MatPaginatorIntl } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { MessageService } from "primeng/api";
import { BobyConfirmationService } from '@boby/services/confirmation/confirmation.service';

import { HalfClaimDialogComponent } from "../half-claim/half-claim-dialog/half-claim-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'erp-half-claim',
    templateUrl: './half-claim.component.html'
})
export class HalfClaimComponent implements OnInit {

    medio: HalfClaim = {};
    selectedMedio: HalfClaim = {};
    medios: HalfClaim[] = [];
    cols: any[] = [];


    submitted: boolean = false;
    medioDialog: boolean = false;
    deleteMediosDialog: boolean = false;

    _selectedColumns: any[];
    isLoading: boolean = false;

    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    pagination: any = [];

    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion', 'codigo', 'nombre_medio', 'orden', 'estado_reg', 'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'];
    loading: boolean;

    momento: string = '';
    configForm: FormGroup;
    constructor(
        private messageService: MessageService,
        private _settingS: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _fcService: BobyConfirmationService,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {

        this.cols = [
            { field: 'codigo', header: 'Codigo', width: 'min-w-40'},
            { field: 'nombre_medio', header: 'Medio Reclamo', width: 'min-w-72'},
            { field: 'orden', header: 'Orden', width: 'min-w-20'},

            { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-32',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];

        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de eliminar el registro.`,
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        this._selectedColumns = this.cols;
        //this._changeDetectorRef.markForCheck();
        this._settingS.getMedioReclamo().subscribe(
            (resp) => {
                //this.medios = resp.medios;
                this.dataSource = new MatTableDataSource(resp.medios);

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

                //this.paginator.itemsPerPageLabel = 'items por pagina';
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
                    return this._settingS.searchMedioReclamo(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.medios);
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
                this.showEditHalfClaimDialog(this.selectedMedio);
                break;
            case 'eliminar':
                this.deleteMedio(this.selectedMedio);
                break;
            case 'exportar':
                break;
        }
    }

    /**
     * Show dialog half claim form
     */
    showNewHalfClaimDialog(){

        this.medio = this.selectedMedio = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(HalfClaimDialogComponent,{
            height: '70%',
            width: '50%',
            data: {momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Medio Reclamo ${result.nombre_medio}  Guardado`,
                        life: 6000
                    });
                    this.refreshMedio();
                }
            });

    }

    showEditHalfClaimDialog(medio: HalfClaim) {

        this.medio = { ...medio };
        this.momento = 'editar';

        const dialogRef = this._matDialog.open(HalfClaimDialogComponent,{
            height: '70%',
            width: '50%',
            data: {medio: medio, momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Medio Reclamo ${result.nombre_medio} Modificado`, life: 6000 });
                this.refreshMedio();
            });
    }

    hideDialog() {
        this.medioDialog = false;
        this.submitted = false;
    }


    refreshMedio(){
        this._settingS.getMedioReclamo().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.medios);
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
        this.medio = this.selectedMedio = {};
        this.submitted = false;
        this.medioDialog = true;
        this.momento = 'nuevo';
    }

    deleteSelectedMedios() {
        this.deleteMediosDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    editMedio(medio: HalfClaim) {
        this.medio = { ...medio };
        this.medioDialog = true;
        this.momento = 'editar';
    }

    deleteMedio(medio: HalfClaim) {
        this.medio = { ...medio };
        this.momento = 'eliminar';

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if ( result == 'confirmed' ){
                this._settingS.deleteMedioReclamo(this.selectedMedio.id_medio_reclamo).subscribe(
                    (resp) => {
                        this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Medio de Reclamo ${this.selectedMedio.nombre_medio} Eliminado`, life: 3000 });
                        this._settingS.getMedioReclamo().subscribe(
                            (resp) => {
                                this.dataSource = new MatTableDataSource(resp.medios);
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
        });
    }

    confirmDeleteSelected() {
        this._settingS.deleteMedioReclamo(this.selectedMedio.id_medio_reclamo).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Medio de Reclamo ${this.selectedMedio.nombre_medio} Eliminado`, life: 3000 });
                this._settingS.getMedioReclamo().subscribe(
                    (resp) => {
                        this.dataSource = new MatTableDataSource(resp.medios);
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

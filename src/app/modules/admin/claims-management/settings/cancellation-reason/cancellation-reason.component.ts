import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService } from "primeng/api";
import { SettingsService } from '../settings.service';


import { takeUntil, Subject, merge, switchMap, map, Observable, debounceTime } from 'rxjs';
import { CancellationReasonDialogComponent } from "../cancellation-reason/cancellation-reason-dialog/cancellation-reason-dialog.component";
import { MatDialog } from "@angular/material/dialog";

import { CancellationReason } from '../settings.type';

@Component({
    selector: 'erp-cancellation-reason',
    templateUrl: './cancellation-reason.component.html'
})
export class CancellationReasonComponent implements OnInit {

    motivo: CancellationReason = {};
    selectedMotivo: CancellationReason = {};
    motivos: CancellationReason[] = [];
    selectedMotivos: CancellationReason[] = [];
    cols: any[] = [];
    submitted: boolean = false;
    motivoDialog: boolean = false;
    deleteMotivoDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['accion','motivo', 'orden', 'estado_reg', 'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'];
    loading: boolean;

    momento: string = '';

    constructor(
        private messageService: MessageService,
        private _settingS: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.cols = [
            { field: 'motivo', header: 'Motivo', width: 'min-w-72'},
            { field: 'orden', header: 'Orden', width: 'min-w-20'},
            { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-32',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._settingS.getMotivoAnulacion().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.motivos);
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
                    return this._settingS.searchMotivoAnulacion(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.motivos);
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
                this.showEditCancellationDialog(this.selectedMotivo);
                break;
            case 'eliminar':
                this.deleteMotivoAnulacion(this.selectedMotivo);
                break;
            case 'exportar':
                break;
        }
    }

    hideDialog() {
        this.motivoDialog = false;
        this.submitted = false;
    }

    /**
     * Show dialog compensation form
     */
    showNewCancellationDialog(){

        this.motivo = this.selectedMotivo = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(CancellationReasonDialogComponent,{
            height: '55%',
            width: '40%',
            data: {momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Motivo Anulacion ${result.motivo}  Guardado`,
                        life: 6000
                    });
                    this.refreshMotivo();
                }
            });

    }

    showEditCancellationDialog(motivo: CancellationReason) {

        this.motivo = { ...motivo };
        this.momento = 'editar';

        const dialogRef = this._matDialog.open(CancellationReasonDialogComponent,{
            height: '55%',
            width: '40%',
            data: {motivo: motivo, momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({severity: 'success', summary: 'Exito', detail: `Motivo Anulacion ${result.motivo} Modificado`, life: 6000});
                    this.refreshMotivo();
                }
            });
    }



    refreshMotivo(){
        this._settingS.getMotivoAnulacion().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.motivos);
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
        this.motivo = this.selectedMotivo = {};
        this.submitted = false;
        this.motivoDialog = true;
        this.momento = 'nuevo';
    }

    deleteSelectedMedios() {
        this.deleteMotivoDialog = true;
    }

    editMotivoAnulacion(motivo: CancellationReason) {
        this.motivo = { ...motivo };
        this.motivoDialog = true;
        this.momento = 'editar';
    }

    deleteMotivoAnulacion(motivo: CancellationReason) {
        this.deleteMotivoDialog = true;
        this.motivo = { ...motivo };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteMotivoDialog = false;
        this._settingS.deleteMotivoAnulacion(this.selectedMotivo.id_motivo_anulado).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Motivo Anulación ${this.selectedMotivo.motivo} Eliminado`, life: 3000 });
                this._settingS.getMotivoAnulacion().subscribe(
                    (resp) => {
                        this.dataSource = new MatTableDataSource(resp.motivos);
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

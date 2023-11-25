import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";

import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';

import { MessageService } from "primeng/api";
import { SettingsService } from "../settings.service";

import {Customer, Holiday} from "../settings.type";
import {HolidayDialogComponent} from "../holiday/holiday-dialog/holiday-dialog.component";

@Component({
    selector: 'erp-holiday',
    templateUrl: './holiday.component.html'
})
export class HolidayComponent implements OnInit {

    feriado: Holiday = {};
    selectedFeriado: Holiday = {};
    feriados: Holiday [] = [];
    selectedFeriados: Holiday[] = [];
    cols: any[] = [];
    submitted: boolean = false;
    feriadoDialog: boolean = false;
    deleteFeriadoDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    loading: boolean;
    momento: string = '';
    public FeriadoForm: FormGroup;

    displayedColumns: string[];
    constructor(
        private messageService: MessageService,
        private _settingS: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        /*this.FeriadoForm = this._formBuilder.group({
            id_feriado: [''],
            fecha: ['',[Validators.required]],
            descripcion: ['',[Validators.required]],
            tipo: ['',[Validators.required]],
            id_lugar: ['',[Validators.required]],
            estado: ['',[Validators.required]],
            id_origen: ['',[Validators.required]]
        });*/

        this.displayedColumns = [
            'accion','descripcion','fecha','tipo','estado','lugar',
            'estado_reg','fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
        ];

        this.cols = [
            { field: 'descripcion', header: 'Descripción', width: 'min-w-72'},
            { field: 'fecha', header: 'Fecha', width: 'min-w-32'},
            { field: 'tipo', header: 'Tipo', width: 'min-w-20'},
            { field: 'estado', header: 'Estado', width: 'min-w-20'},
            { field: 'lugar', header: 'Lugar', width: 'min-w-20'},
            { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-32',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._settingS.getFeriado().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.feriados);
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

                this.paginator.page.subscribe(
                    (event) => {
                    }
                );
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._settingS.searchFeriado(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.feriados);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    /**
     * Show new dialog holiday form
     */
    showNewHolidayDialog(){

        this.feriado = this.selectedFeriado = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(HolidayDialogComponent,{
            height: '75%',
            width: '80%',
            data: {momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Feriado ${result.apellido_paterno} ${result.apellido_materno} ${result.nombre} Guardado`,
                        life: 6000
                    });
                    this.refreshFeriado();
                }
            });

    }

    /**
     * Show edit dialog holiday form
     */
    showEditHolidayDialog(feriado: Holiday) {

        //this.FeriadoForm.patchValue(feriado);
        this.feriado = { ...feriado };

        this.momento = 'editar';

        const dialogRef = this._matDialog.open(HolidayDialogComponent,{
            height: '50%',
            width: '70%',
            data: {feriado: feriado, momento: this.momento}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Feriado ${result.descripcion} Modificado`, life: 6000 });
                this.refreshFeriado();
            });
    }



    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                this.showEditHolidayDialog(this.selectedFeriado);
                break;
            case 'eliminar':
                this.deleteFeriado(this.selectedFeriado);
                break;
            case 'exportar':
                break;
        }
    }

    hideDialog() {
        this.feriadoDialog = false;
        this.submitted = false;
    }



    refreshFeriado(){
        this._settingS.getFeriado().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.feriados);
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
        this.feriado = this.selectedFeriado = {};
        //this.FeriadoForm.reset();
        this.submitted = false;
        this.feriadoDialog = true;
        this.momento = 'nuevo';
    }


    deleteFeriado(feriado: Holiday) {
        this.deleteFeriadoDialog = true;
        this.feriado = { ...feriado };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        this.deleteFeriadoDialog = false;
        this._settingS.deleteFeriado(this.selectedFeriado.id_feriado).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Feriado ${this.selectedFeriado.descripcion} Eliminado`, life: 3000 });
                this.refreshFeriado();
                /*this._settingS.getCliente().subscribe(
                    (resp) => {
                        this.dataSource = new MatTableDataSource(resp.clientes);
                        this.loading = false;
                        this.pagination = resp.pagination;
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                        this._changeDetectorRef.markForCheck();
                    }
                );*/
            }
        );
    }

}

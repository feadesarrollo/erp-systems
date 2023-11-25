/*import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Customer } from "../settings.type";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MessageService} from "primeng/api";
import { SettingsService } from '../settings.service';
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { MatDialog } from "@angular/material/dialog";
import { CustomerDialogComponent } from '../customer/customer-dialog/customer-dialog.component';
import {ActivatedRoute, Router} from "@angular/router";
import {BobyMediaWatcherService} from "../../../../../../@boby/services/media-watcher";*/

import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
@Component({
    selector: 'erp-customer',
    templateUrl: './customer.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerComponent implements OnInit {
    constructor() { }

    ngOnInit(): void {
    }
    /*cliente: Customer = {};
    selectedCliente: Customer = {};
    clientes: Customer[] = [];
    cols: any[] = [];
    submitted: boolean = false;
    clienteDialog: boolean = false;
    deleteClienteDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = [
        'accion','nombre_completo2', 'genero', 'ci','lugar_expedicion','nacionalidad','celular','telefono',
        'email','email2','direccion','pais_residencia','ciudad_residencia','barrio_zona','estado_reg',
        'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
    ];
    loading: boolean;
    momento: string = '';
    public ClienteForm: FormGroup;
    drawerMode: 'side' | 'over';
    constructor(
        private messageService: MessageService,
        private _settingS: SettingsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _fuseMediaWatcherService: BobyMediaWatcherService,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.cols = [
            { field: 'nombre_completo2', header: 'Nombre', width: 'min-w-80'},
            { field: 'genero', header: 'Genero', width: 'min-w-20'},
            { field: 'ci', header: 'Nro. Documento', width: 'min-w-32'},
            { field: 'lugar_expedicion', header: 'Expedición', width: 'min-w-32'},
            { field: 'nacionalidad', header: 'Nacionalidad', width: 'min-w-32'},
            { field: 'celular', header: 'Celular', width: 'min-w-32'},
            { field: 'telefono', header: 'Telefono', width: 'min-w-32'},
            { field: 'email', header: 'Email', width: 'min-w-72'},
            { field: 'email2', header: 'Email2', width: 'min-w-72'},
            { field: 'direccion', header: 'Dirección', width: 'min-w-80'},
            { field: 'pais_residencia', header: 'Pais Residencia', width: 'min-w-32'},
            { field: 'ciudad_residencia', header: 'Ciudad Recidencia', width: 'min-w-40'},
            { field: 'barrio_zona', header: 'Barrio', width: 'min-w-52'},

            { field: 'estado_reg', header: 'Estado', width: 'min-w-32'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._settingS.getCliente().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.clientes);
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
                    return this._settingS.searchCliente(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.clientes);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    /!**
     * On backdrop clicked
     *!/
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                this.showEditCustomerDialog(this.selectedCliente);
                break;
            case 'eliminar':
                this.deleteCustomer(this.selectedCliente);
                break;
            case 'exportar':
                break;
        }
    }

    refreshCliente(){
        this.loading = true;
        this._settingS.getCliente().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.clientes);
                this.loading = false;
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /!**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     *!/
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

    /!**
     * Show dialog customer form
     *!/
    showNewCustomerDialog(){

        this.cliente = this.selectedCliente = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(CustomerDialogComponent,{
            height: '75%',
            width: '30%',
            data: {
                momento: this.momento
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Cliente ${result.apellido_paterno} ${result.apellido_materno} ${result.nombre} Guardado`,
                        life: 6000
                    });
                    this.refreshCliente();
                }
            });

    }

    showEditCustomerDialog(cliente: Customer) {

        this.cliente = { ...cliente };
        this.momento = 'editar';

        const dialogRef = this._matDialog.open(CustomerDialogComponent,{
            height: '75%',
            width: '80%',
            data: {cliente: cliente, momento: this.momento}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Cliente ${result.apellido_paterno} ${result.apellido_materno} ${result.nombre} Modificado`, life: 6000 });
                this.refreshCliente();
            });
    }

    deleteCustomer(cliente: Customer) {
        this.deleteClienteDialog = true;
        this.cliente = { ...cliente };
        this.momento = 'eliminar';

        this._settingS.deleteCliente(cliente.id_cliente).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Cliente ${cliente.nombre_completo2} Eliminado`, life: 6000 });
                this._settingS.getCliente().subscribe(
                    (resp) => {
                        this.dataSource = new MatTableDataSource(resp.clientes);
                        this.loading = false;
                        this.pagination = resp.pagination;
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;
                        this._changeDetectorRef.markForCheck();
                    }
                );
            }
        );
    }*/
}

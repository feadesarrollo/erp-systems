import {ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {Office} from "../../../claims-management/settings/settings.type";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {SettingsService} from "../../../claims-management/settings/settings.service";
import {MatDialog} from "@angular/material/dialog";
import {BobyLoadingService} from "../../../../../../@boby/services/loading";
import {OfficeDialogComponent} from "../../../claims-management/settings/office/office-dialog/office-dialog.component";

import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import {ActivatedRoute, Router} from "@angular/router";
import {HumanTalentService} from "../../human-talent.service";

@Component({
    selector: 'erp-office',
    templateUrl: './office.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficeComponent implements OnInit {

    oficina: Office = {};
    selectedOficina: Office = {};
    oficinas: Office [] = [];
    selectedOficinas: Office[] = [];
    cols: any[] = [];
    submitted: boolean = false;
    oficinaDialog: boolean = false;
    deleteOficinaDialog: boolean = false;
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
    public OficinaForm: FormGroup;
    public listaLugar: any;
    displayedColumns = [
        'accion', 'nombre','codigo','nombre_lugar','correo_oficina','direccion','aeropuerto',
        'estado_reg','fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
    ];

    constructor(
        private messageService: MessageService,
        private _HTService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _loadService: BobyLoadingService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.OficinaForm = this._formBuilder.group({
            id_oficina: [''],
            id_lugar: ['',[Validators.required]],
            codigo: ['',[Validators.required]],
            nombre: ['',[Validators.required]],
            correo_oficina: ['',[Validators.required]],
            aeropuerto: ['',[Validators.required]],
            direccion: ['',[Validators.required]]
        });

        this.cols = [
            { field: 'nombre', header: 'Nombre Oficina', width: 'min-w-72'},
            { field: 'codigo', header: 'Codigo', width: 'min-w-20'},
            { field: 'nombre_lugar', header: 'Lugar', width: 'min-w-40'},
            { field: 'correo_oficina', header: 'Correo', width: 'min-w-60'},
            { field: 'direccion', header: 'Dirección', width: 'min-w-72'},
            { field: 'aeropuerto', header: 'Aeropuerto', width: 'min-w-20'},

            { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-32',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._loadService.show();
        this._HTService.getOffices().subscribe(
            (resp) => {
                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.officeList);
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
                        console.log('event',event)
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
                    return this._HTService.searchOffice(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.offices);
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
     * Filter por lugar
     *
     * @param change
     */
    /*searchLugar(query: string, tipo: string): void
    {
        this._settingS.searchLugar(query, tipo).subscribe(
            (listaLugar) => {
                this.listaLugar = listaLugar;
            }
        );
    }*/

    /**
     * Get Nombre Funcionario Recepcion
     */
    getLugar(id_lugar: string) {
        if ( this.listaLugar != undefined ) {
            return this.listaLugar.find(oficina => oficina.id_lugar === id_lugar).nombre;
        }else{
            return this.oficina.nombre_lugar;
        }
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                this.showEditOfficeDialog(this.selectedOficina);
                break;
            case 'eliminar':
                this.deleteOficina(this.selectedOficina);
                break;
            case 'exportar':
                break;
        }
    }
    redirect(id){
        this._router.navigate(['./', id], {relativeTo: this._activatedRoute});
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    hideDialog() {
        this.oficinaDialog = false;
        this.submitted = false;
    }

    refreshOficina(){
        this._HTService.getOffices().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.officeList);
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


    /**
     * Show dialog compensation form
     */
    showNewOfficeDialog(){

        this.oficina = this.selectedOficina = {};
        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(OfficeDialogComponent,{
            height: '75%',
            width: '80%',
            data: {momento: this.momento}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Exito',
                        detail: `Oficina ${result.nombre}  Guardado`,
                        life: 6000
                    });
                    this.refreshOficina();
                }
            });

    }

    /**
     * Show edit dialog holiday form
     */
    showEditOfficeDialog(oficina: Office) {

        this.oficina = { ...oficina };

        this.momento = 'editar';

        const dialogRef = this._matDialog.open(OfficeDialogComponent,{
            height: '75%',
            width: '80%',
            data: {oficina: oficina, momento: this.momento}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Oficina ${result.nombre} Modificado`, life: 6000 });
                this.refreshOficina();
            });
    }

    deleteOficina(oficina: Office) {
        this.deleteOficinaDialog = true;
        this.oficina = { ...oficina };
        this.momento = 'eliminar';
    }

    confirmDeleteSelected() {
        /*this.deleteOficinaDialog = false;
        this._settingS.deleteOficina(this.selectedOficina.id_oficina).subscribe(
            (resp) => {
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: `Oficina ${this.selectedOficina.nombre} Eliminado`, life: 3000 });
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
        );*/
    }

}

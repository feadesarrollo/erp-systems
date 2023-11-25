import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    ElementRef,
    Inject,
    ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {takeUntil, Subject, switchMap, map, debounceTime} from "rxjs";
import {HumanTalentService} from "../../human-talent.service";
import { OfficialDialogComponent } from  './official-dialog/official-dialog.component';
import {MatDialog} from "@angular/material/dialog";
import {MessageService} from "primeng/api";
import {BobyLoadingService} from "../../../../../../@boby/services/loading";

@Component({
    selector: 'erp-officials',
    templateUrl: './officials.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficialsComponent implements OnInit {

    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    //public officials: any;

    public cols : any [] = [
        //{ field: 'id_funcionario', header: 'Funcionario', width: 'min-w-20'},
        { field: 'desc_person', header: 'Funcionario', width: 'min-w-96'},
        { field: 'tipo_contrato', header: 'Contrato', width: 'min-w-40'},
        { field: 'nombre_cargo', header: 'Cargo', width: 'min-w-96'},
        { field: 'tiempo_empresa', header: 'Tiempo Empresa', width: 'min-w-72'},
        { field: 'jubilado', header: 'Jubilado', width: 'min-w-40'},
        { field: 'fecha_asignacion', header: 'Fecha Ultima Asignación', width: 'min-w-60'},
        { field: 'fecha_finalizacion', header: 'Fecha Finalización', width: 'min-w-52'},
        { field: 'nombre_oficina', header: 'Oficina (Item)', width: 'min-w-80'},
        { field: 'nombre_lugar_ofi', header: 'Lugar Oficina(Item)', width: 'min-w-72'},
        { field: 'base_operativa', header: 'Base Operativa', width: 'min-w-40'},
        { field: 'categoria', header: 'Categoria', width: 'min-w-72'},
        { field: 'centro_costo', header: 'Centro Costo', width: 'min-w-96'},
        { field: 'codigo', header: 'Codigo', width: 'min-w-40'},
        { field: 'id_biometrico', header: 'Biometrico', width: 'min-w-40'}
    ];
    public _selectedColumns : any [] = this.cols;

    displayedColumns = [
        'accion','desc_person','tipo_contrato','nombre_cargo','tiempo_empresa','jubilado','fecha_asignacion','fecha_finalizacion','nombre_oficina',
        'nombre_lugar_ofi','base_operativa','categoria','centro_costo','codigo','id_biometrico'
    ];

    public selectedOfficial: any;
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _route: ActivatedRoute,
        private _htService: HumanTalentService,
        private _matDialog: MatDialog,
        private messageService: MessageService,
        private _loadService: BobyLoadingService,
        private _router: Router
    ) { }

    ngOnInit(): void {

        this._loadService.show();
        this._htService.getOfficials().subscribe(
            (resp) => {
                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.officialsList);
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
                    return this._htService.searchOfficialsByOffice(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.officials);
                    this.pagination = search.pagination;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    /**
     * Show dialog compensation form
     */
    showNewOfficialDialog(){


        const dialogRef = this._matDialog.open(OfficialDialogComponent,{
            height: '75%',
            width: '80%',
            data: {status: 'new'}
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
                    this.refreshOfficials();
                }
            });

    }

    ngAfterViewInit() {
        /*this.paginator._intl.itemsPerPageLabel="Registros por pagina";
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
        this.pagination = this.officials.pagination;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.paginator.page.subscribe(
            (event) => {

            }
        );*/
    }

    executeCommand(action: string): void{
        switch (action) {
            case 'programa':
                this._router.navigate([`/system/human-talent/processes/officials/${this.selectedOfficial.id_funcionario}/official-psychoactive`], {relativeTo: this._route});
                // Mark for check
                this._changeDetectorRef.markForCheck();
                break;

        }

    }

    refreshOfficials(): void{
        this._loadService.show();
        this._htService.getOfficials().subscribe(
            (resp) => {
                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.officialsList);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

}

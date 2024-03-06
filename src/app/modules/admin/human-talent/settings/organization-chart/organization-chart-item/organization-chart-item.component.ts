import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { OrganizationChartService } from "../organization-chart.service";
import { takeUntil, Observable, Subject } from 'rxjs';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {FormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDrawer} from "@angular/material/sidenav";
import {BobyMediaWatcherService} from "../../../../../../../@boby/services/media-watcher";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {MatDialog} from "@angular/material/dialog";
import {debounceTime} from "rxjs/operators";

@Component({
    selector: 'erp-organization-chart-item',
    templateUrl: './organization-chart-item.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationChartItemComponent implements OnInit {

    @Input() id_uo: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public pagination: any = [];
    public items: any[] = [];



    public isLoading: boolean = false;
    public selectedItem: any = {};
    public dataSource: MatTableDataSource<any>;
    public searchInputControl: FormControl = new FormControl();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    //@ViewChild(MatSort) sort: MatSort;

    public cols = [
        { field: 'id_cargo', header: 'Identificador', width: 'min-w-32'},
        { field: 'acefalo', header: 'Acefalo', width: 'min-w-96'},
        { field: 'codigo', header: 'Item/Contrato', width: 'min-w-32'},
        { field: 'nombre', header: 'Nombre Cargo', width: 'min-w-96'},
        { field: 'haber_basico', header: 'Haber Basico', width: 'min-w-32'},
        { field: 'fecha_ini', header: 'Activo Desde', width: 'min-w-32'},
        { field: 'fecha_fin', header: 'Activo Hasta', width: 'min-w-32'},
        { field: 'nombre_escala', header: 'Escala Salarial', width: 'min-w-52'},
        { field: 'nombre_tipo_contrato', header: 'Tipo Contrato', width: 'min-w-32'},
        { field: 'nombre_oficina', header: 'Nombre Oficina', width: 'min-w-96'},
        { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44'},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];
    public displayedColumns = [ 'accion','id_cargo','nombre_tipo_contrato','acefalo','codigo','nombre','haber_basico','fecha_ini','fecha_fin','nombre_escala','nombre_oficina',
        'estado_reg','fecha_reg','fecha_mod','usr_reg','usr_mod'];
    private start: number = 0;
    private limit: number = 50;
    public totalRows = 0;
    public currentPage = 0;
    public pageSize = 7;
    public pageSizeOptions = [7, 10, 25, 50, 100];
    private sort = 'codigo';
    private dir = 'asc';
    private query = '';
    drawerMode: 'side' | 'over';
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    constructor(
        private _orgaChartService: OrganizationChartService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _bobyMediaWatcherService: BobyMediaWatcherService
    ) { }

    ngOnInit(): void {

        // Subscribe to media changes
        this._bobyMediaWatcherService.onMediaChange$
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

        this._orgaChartService.getItems(this.id_uo,this.start,this.pageSize,this.sort,this.dir,this.query).subscribe((resp: any) =>{
            this.items = resp.items;
            this.totalRows = resp.total;
            this._changeDetectorRef.markForCheck();
        });

        this.searchInputControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(query => {
                this.query = query;
                this._orgaChartService.getItems(this.id_uo,this.start,this.pageSize,this.sort,this.dir,query).subscribe((resp: any) =>{
                    this.items = resp.items;
                    this.totalRows = resp.total;
                    this._changeDetectorRef.markForCheck();
                });
            });
    }

    ngAfterViewInit() {
        if ( this.paginator ) {
            this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                if (length === 0 || pageSize === 0) {
                    return `0 de ${length}`;
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

            this.paginator.pageIndex = this.currentPage;
            this.paginator.length = this.totalRows;
        }
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this._orgaChartService.getItems(this.id_uo,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                //const resp = JSON.parse(response.datos[0].listclaims);
                this.items = response.items;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    sortData(sort: Sort) {
        console.warn('sortData',sort);
        this.sort = sort.active;
        this.dir = sort.direction;
        this._orgaChartService.getItems(this.id_uo,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                //const resp = JSON.parse(response.datos[0].listclaims);
                this.items = response.items;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    redirect(row){
        this.selectedItem = row;
        this._router.navigate(['./', row.id_cargo], {relativeTo: this._activatedRoute});
    }

    selected(row){
        this.selectedItem = row;
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    refreshItems(momento){

        this._orgaChartService.getItems(this.id_uo,this.start,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (resp: any) => {

                if ( momento == 'save' ) {
                    this.selectedItem = resp.items.find(item => item.id_cargo == this.selectedItem.id_cargo);
                    this._orgaChartService.item = this.selectedItem;

                    this.items = resp.items;
                    this.totalRows = resp.total;
                }else {
                    this.items = resp.items;
                    this.totalRows = resp.total;
                }
                this._changeDetectorRef.markForCheck();

                /*this.dataSource = new MatTableDataSource(resp.items);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();*/

                // Get the items
                /*this._orgaChartService.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {
                        // Update the pagination
                        this.pagination = pagination;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });*/

                // Get the items
                /*this._orgaChartService.items$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((customers: any[]) => {
                        this.items = customers;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });*/
            }
        );
    }

    /**
     * Create summative
     */
    createItem(): void{
        // Create the item
        this._orgaChartService.createItem().subscribe((newItem) => {
            this._orgaChartService.statusItem = 'new';
            this.selectedItem = newItem;
            // Go to the new item
            this._router.navigate(['./', newItem.id_cargo], {relativeTo: this._activatedRoute});
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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

}

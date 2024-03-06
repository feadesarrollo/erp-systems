import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";
import {FormControl} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort, Sort} from "@angular/material/sort";
import {OrganizationChartService} from "../organization-chart.service";
import { takeUntil, Observable, Subject } from 'rxjs';
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {MatDialog} from "@angular/material/dialog";
import {DocumentViewerComponent} from "./document-viewer/document-viewer.component";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'erp-organization-chart-allocation',
  templateUrl: './organization-chart-allocation.component.html'
})
export class OrganizationChartAllocationComponent implements OnInit {

    @Input() id_uo: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public pagination: any = [];

    public isLoading: boolean = false;
    public selectedItem: any = {};
    public dataSource: MatTableDataSource<any>;
    public searchInputControl: FormControl = new FormControl();
    @ViewChild(MatPaginator) paginator: MatPaginator;

    public cols = [
        { field: 'tipo', header: 'Tipo Asignación', width: 'min-w-32'},
        { field: 'desc_funcionario1', header: 'Funcionario', width: 'min-w-96'},
        { field: 'fecha_asignacion', header: 'Fecha Inicio', width: 'min-w-32'},
        { field: 'fecha_finalizacion', header: 'Fecha Fin', width: 'min-w-32'},
        { field: 'desc_cargo', header: 'Item Asignado', width: 'min-w-96'},
        { field: 'observaciones_finalizacion', header: 'Motivo Finalización', width: 'min-w-52'},
        { field: 'categoria', header: 'Categoria', width: 'min-w-72'},
        { field: 'nro_documento_asignacion', header: 'N° Memo', width: 'min-w-32'},
        { field: 'fecha_documento_asignacion', header: 'Fecha Memo', width: 'min-w-32'},
        { field: 'nro_contrato', header: 'N° Contrato', width: 'min-w-52'},
        { field: 'fecha_contrato', header: 'Fecha Contrato', width: 'min-w-32'},
        { field: 'certificacion_presupuestaria', header: 'Certificación Presupuestaria', width: 'min-w-52'},
        { field: 'codigo_ruta', header: 'Codigo Referencia/Hoja Ruta', width: 'min-w-52'},
        { field: 'codigo', header: 'Codigo', width: 'min-w-52'},
        { field: 'ci', header: 'CI', width: 'min-w-20'},
        { field: 'estado_funcional', header: 'Estado Funcional', width: 'min-w-52'},
        { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44'},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];
    public displayedColumns = [ 'accion','tipo','desc_funcionario1','fecha_asignacion','fecha_finalizacion','desc_cargo','observaciones_finalizacion','categoria',
        'nro_documento_asignacion','fecha_documento_asignacion','nro_contrato','fecha_contrato','certificacion_presupuestaria','codigo_ruta','codigo','ci','estado_funcional',
        'estado_reg','fecha_reg','fecha_mod','usr_reg','usr_mod'];

    private start: number = 0;
    public statusFlag: boolean = true;
    public status: string = 'activo';

    public totalRows = 0;
    public currentPage = 0;
    public pageSize = 7;
    public pageSizeOptions = [7, 10, 25, 50, 100];
    public viewer_file: string ='url';
    public items: any[] = [];

    private sort = 'desc_funcionario1';
    private dir = 'asc';
    private query = '';

    constructor(
        private _orgaChartService: OrganizationChartService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _loadService: BobyLoadingService,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this._orgaChartService.getAllocations(this.id_uo,this.status,this.start,this.pageSize,this.sort,this.dir,this.query).subscribe((resp: any) =>{
            this.items = resp.items;
            this.totalRows = resp.total;
            this._changeDetectorRef.markForCheck();
        });

        this.searchInputControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(query => {
                this.query = query;
                this._orgaChartService.getAllocations(this.id_uo,this.status,this.start,this.pageSize,this.sort,this.dir,query).subscribe((resp: any) =>{
                    this.items = resp.items;
                    this.totalRows = resp.total;
                    this._changeDetectorRef.markForCheck();
                });
            });
    }

    refreshItems(momento){

        this._orgaChartService.getAllocations(this.id_uo,this.status,this.start,this.pageSize,this.sort,this.dir,this.query).subscribe(
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
            }
        );
    }

    sortData(sort: Sort) {
        this.sort = sort.active;
        this.dir = sort.direction;
        this._orgaChartService.getAllocations(this.id_uo,this.status,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                this.items = response.items;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this._orgaChartService.getAllocations(this.id_uo,this.status,this.currentPage*this.pageSize,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (response:any) => {
                this.items = response.items;
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    ngAfterViewInit(){
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

            this.paginator.page.subscribe(
                (event) => {

                }
            );
        }
    }

    setStatus(flag,status){
        this.status = status;
        this.statusFlag = flag;
        this._orgaChartService.getAllocations(this.id_uo,this.status,this.start,this.pageSize,this.sort,this.dir,this.query).subscribe(
            (resp: any) => {
                this.items = resp.items;
                this.totalRows = resp.total;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    generateContract(){
        this.viewer_file = 'url';

        this.selectedItem.viewer_file = this.viewer_file;

        this._loadService.show();
        this._orgaChartService.generateContract(this.selectedItem.id_uo_funcionario)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                console.warn('response',response);
                this._loadService.hide();
                const detalle = response.detail;
                this.selectedItem.archivo_generado = detalle.archivo_generado;
                this.selectedItem.viewer_file = this.viewer_file;
                const dialogRef = this._matDialog.open(DocumentViewerComponent, {
                    data: this.selectedItem
                });

                dialogRef.afterClosed()
                    .subscribe((result) => {

                    });
            });
    }

}

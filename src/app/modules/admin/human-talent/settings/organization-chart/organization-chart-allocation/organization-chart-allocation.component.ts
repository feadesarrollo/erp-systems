import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatTableDataSource} from "@angular/material/table";
import {FormControl} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {OrganizationChartService} from "../organization-chart.service";
import { takeUntil, Observable, Subject } from 'rxjs';

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
    @ViewChild(MatSort) sort: MatSort;
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
    private limit: number = 6;
    public statusFlag: boolean = true;
    public status: string = 'activo';
    constructor(
        private _orgaChartService: OrganizationChartService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this._orgaChartService.getAllocations(this.id_uo,this.start,this.limit,this.status).subscribe(resp =>{

            this.dataSource = new MatTableDataSource(resp.items);
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
            this.pagination = resp.pagination;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            this.paginator.page.subscribe(
                (event) => {

                }
            );
        });
    }

    refreshItems(){

        this._orgaChartService.getAllocations(this.id_uo,this.start,this.limit,this.status).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.items);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    setStatus(flag,status){
        this.status = flag;
        this._orgaChartService.getAllocations(this.id_uo,this.start,this.limit,status).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.items);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

}

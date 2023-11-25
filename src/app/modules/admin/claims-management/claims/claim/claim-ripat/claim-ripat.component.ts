import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {cloneDeep} from "lodash-es";
import { BehaviorSubject, combineLatest, Subject, takeUntil, Observable } from 'rxjs';
import {MatCheckboxChange} from "@angular/material/checkbox";
import {ClaimRipatService} from "./claim-ripat.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'erp-claim-ripat',
  templateUrl: './claim-ripat.component.html',
  styleUrls: ['./claim-ripat.component.scss']
})
export class ClaimRipatComponent implements OnInit {

    public selectedClaim: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public displayedColumns = [
        'accion','nro_tramite','dias_respuesta','desc_nom_cliente','desc_nombre_funcionario','dias_informe','correlativo_preimpreso_frd','nro_frsa','nro_pir','nro_att_canalizado','nro_ripat_att',
        'nro_hoja_ruta','pnr','nro_vuelo','fecha_hora_vuelo','origen','transito','destino','desc_nombre_incidente','desc_sudnom_incidente','fecha_hora_incidente',
        'desc_oficina_registro_incidente', 'detalle_incidente','observaciones_incidente','desc_nombre_fun_denun','desc_nombre_oficina','fecha_hora_recepcion',
        'desc_nombre_medio','motivo_anulado',
        'estado_reg', 'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
    ];

    public cols = [
        { field: 'nro_tramite', header: 'Nro. Tramite', width: 'min-w-36'},
        { field: 'dias_respuesta', header: 'Dias Para Responder', width: 'min-w-36'},
        { field: 'desc_nom_cliente', header: 'Cliente', width: 'min-w-64'},
        { field: 'desc_nombre_funcionario', header: 'Funcionario', width: 'min-w-72'},
        { field: 'dias_informe', header: 'Dias Informe', width: 'min-w-28'},
        { field: 'correlativo_preimpreso_frd', header: 'Preimpreso FRD', width: 'min-w-28'},
        { field: 'nro_frsa', header: 'Nro. frsa', width: 'min-w-28'},
        { field: 'nro_pir', header: 'Nro. Pir', width: 'min-w-28'},
        { field: 'nro_att_canalizado', header: 'ATT Canalizado', width: 'min-w-28'},
        { field: 'nro_ripat_att', header: 'Ripat ATT', width: 'min-w-28'},
        { field: 'nro_hoja_ruta', header: 'Hoja Ruta', width: 'min-w-28'},
        { field: 'pnr', header: 'PNR', width: 'min-w-28'},
        { field: 'nro_vuelo', header: 'Nro. Vuelo', width: 'min-w-28'},
        { field: 'fecha_hora_vuelo', header: 'Fecha, Hora Vuelo', width: 'min-w-32'},
        { field: 'origen', header: 'Origen', width: 'min-w-32'},
        { field: 'transito', header: 'Transito', width: 'min-w-32'},
        { field: 'destino', header: 'Destino', width: 'min-w-32'},
        { field: 'desc_nombre_incidente', header: 'Nombre Incidente', width: 'min-w-44'},
        { field: 'desc_sudnom_incidente', header: 'Subtipo Incidente', width: 'min-w-44'},
        { field: 'fecha_hora_incidente', header: 'Fecha Incidente', width: 'min-w-32'},

        { field: 'desc_oficina_registro_incidente', header: 'Oficina Registro', width: 'min-w-52'},
        { field: 'detalle_incidente', header: 'Detalle Incidente', width: 'min-w-96'},
        { field: 'observaciones_incidente', header: 'Observacion Incidente', width: 'min-w-96'},
        { field: 'desc_nombre_fun_denun', header: 'Funcionario Denunciado', width: 'min-w-52'},
        { field: 'desc_nombre_oficina', header: 'Ofina Recepcion', width: 'min-w-52'},
        { field: 'fecha_hora_recepcion', header: 'Fecha Recepcion', width: 'min-w-32'},
        { field: 'desc_nombre_medio', header: 'Nombre Medio', width: 'min-w-60'},
        { field: 'motivo_anulado', header: 'Motivo Anulado', width: 'min-w-52'},

        { field: 'estado_reg', header: 'Estado', width: 'min-w-28'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];

    private displayedColumnsCheck = cloneDeep(this.displayedColumns);
    private listCheck: any;
    private hiddenColumns = ['detalle_incidente','observaciones_incidente'];
    public pageSizeOptions: number[] = [5,10,20,30,40,50,100,200];
    public pageSize = 50;
    public isLoading: boolean = false;
    public pagination: any = {};
    //public claims: any = [];
    public claims: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        public matDialogRef: MatDialogRef<ClaimRipatComponent>,
        private _ripat: ClaimRipatService
    ) { }

    ngOnInit(): void {
        let col;
        this.displayedColumnsCheck.shift();
        this.listCheck = this.displayedColumnsCheck.map( (item,index) => {
            col = this.cols.find(elem => elem.field == item);
            if ( this.hiddenColumns.includes(col.field) ){
                this.displayedColumns = this.displayedColumns.filter( item => item !== col.field);
                return {field: col.field, header: col.header, width: col.width, checked: false, order: index + 1};
            }else{
                return {field: col.field, header: col.header, width: col.width, checked: true, order: index + 1};
            }
        });

        this._ripat.getRipatClaims().subscribe(
            (items) => {
                // Get the pagination
                this._ripat.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {

                        // Update the pagination
                        this.pagination = pagination;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get the claims

                this._ripat.claim$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((claims: any) => {

                        // Update the pagination
                        //this.claims = claims;
                        this.claims = new MatTableDataSource(claims);

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
                        this.claims.paginator = this.paginator;
                        this.claims.sort = this.sort;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            }
        );

    }

    showOptions(event:MatCheckboxChange): void {
        const item = this.listCheck.filter((elem) => {
            if (elem.field == event.source.value){
                elem.checked = event.checked
                return elem;
            }
        });

        if (event.checked){
            this.displayedColumns.splice(item[0].order,0,event.source.value);
        }else{
            this.displayedColumns = this.displayedColumns.filter( item => item !== event.source.value);
        }
    }

    /**
     * close
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }
}

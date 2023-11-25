import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ReportsService } from '../reports.service';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'erp-claim-book',
  templateUrl: './claim-book.component.html',
  styleUrls: ['./claim-book.component.scss']
})
export class ClaimBookComponent implements OnInit {

    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    pagination: any = [];
    displayedColumns: string[];
    cols: any[] = [];
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    SearchForm: FormGroup;

    listaFiltro: any[] = [];
    listaGestion: any[] = [];
    listaOficina: any[] = [];
    filtro : string = 'otro';

    constructor(
        private _reporteS: ReportsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {

        this.SearchForm = this._formBuilder.group({
            filtro: ['',[Validators.required]],
            gestion: [''],
            fecha_ini: [''],
            fecha_fin: [''],
            id_oficina_registro_incidente: ['',[Validators.required]]
        });
        this.SearchForm.get('id_oficina_registro_incidente').setValue(0);
        this.displayedColumns = [
            'nro_frd','correlativo_preimpreso_frd','nombre','celular','nombre_incidente',
            'fecha_hora_incidente','fecha_hora_recepcion','fecha_hora_recepcion_sac'/*,'detalle_incidente'*/
        ];

        this.cols = [
            { field: 'nro_frd', header: 'FRD', width: 'min-w-20'},
            { field: 'correlativo_preimpreso_frd', header: 'Preimpreso', width: 'min-w-20'},
            { field: 'nombre', header: 'Nombre Cliente', width: 'min-w-72'},
            { field: 'celular', header: 'Datos Contacto', width: 'min-w-32'},
            { field: 'nombre_incidente', header: 'Motivo Reclamo', width: 'min-w-72'},
            { field: 'fecha_hora_incidente', header: 'Fecha Incidente', width: 'min-w-32'},
            { field: 'fecha_hora_recepcion', header: 'Fecha Recepción', width: 'min-w-32'},
            { field: 'fecha_hora_recepcion_sac', header: 'Fecha Envio Central', width: 'min-w-32'},
            /*{ field: 'detalle_incidente', header: 'Detalle Reclamo', width: 'min-w-72'}*/
        ];

        this.listaFiltro = [
            { value: 'gestion', title: 'Gestión'},
            { value: 'fechas', title: 'Fechas'},

        ];
        this._selectedColumns = this.cols;

    }

    /**
     * load Oficina
     */
    searchOficina(query: string): void
    {
        this._reporteS.searchOficina(query).subscribe(
            (resp) => {
                this.listaOficina = resp;
            }
        );
    }

    /**
     * Get Nombre Oficina Incidente
     */
    getOficina(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' && id_oficina != '0' ) {
            return this.listaOficina.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else{
            return 'TODOS';
        }
    }

    refreshLibro(){

    }

    onFiltroChange(event){
        this.filtro = event.value;
        if (this.filtro == 'gestion'){
            this.SearchForm.get('fecha_ini').reset();
            this.SearchForm.get('fecha_fin').reset();
            this._reporteS.getGestion().subscribe(
                (resp) => {
                    this.listaGestion = resp;
                }
            );
        }else{
            this.SearchForm.get('gestion').reset();
        }

    }

    onGestionChange(ev){

        let id_oficina = this.SearchForm.get('id_oficina_registro_incidente').value;
        let gestion = this.listaGestion.find(ges => ges.id_gestion === ev.value);
        this._reporteS.getReclamo({id_oficina: id_oficina,gestion: gestion.gestion} ).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.reclamos);
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
    }

    onOficinaChange(ev){

    }

}

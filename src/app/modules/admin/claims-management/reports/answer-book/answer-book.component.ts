import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ReportsService } from '../reports.service';

@Component({
  selector: 'erp-answer-book',
  templateUrl: './answer-book.component.html',
  styleUrls: ['./answer-book.component.scss']
})
export class AnswerBookComponent implements OnInit {

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
            'correlativo','fecha','tipo','oficina','cliente'
        ];

        this.cols = [
            { field: 'correlativo', header: 'OB-CC-N', width: 'min-w-20'},
            { field: 'fecha', header: 'Fecha', width: 'min-w-20'},
            { field: 'tipo', header: 'Asunto', width: 'min-w-72'},
            { field: 'oficina', header: 'Oficina', width: 'min-w-32'},
            { field: 'cliente', header: 'Destinatario', width: 'min-w-44'}
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
        this._reporteS.getRespuesta({id_oficina: id_oficina,gestion: gestion.gestion} ).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.respuestas);
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
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'erp-operational-base',
  templateUrl: './operational-base.component.html'
})
export class OperationalBaseComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = [
        'accion','nombre_completo2', 'genero', 'ci','lugar_expedicion','nacionalidad','celular','telefono',
        'email','email2','direccion','pais_residencia','ciudad_residencia','barrio_zona','estado_reg',
        'fecha_reg','fecha_mod', 'usr_reg', 'usr_mod'
    ];
    loading: boolean;

    constructor() { }

    ngOnInit(): void {
    }

}

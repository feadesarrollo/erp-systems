import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'erp-headboard',
  templateUrl: './headboard.component.html'
})
export class HeadboardComponent implements OnInit {
    public dataUser = JSON.parse(localStorage.getItem('aut'));

    public avatar:string = `https://erp.boa.bo/uploaded_files/sis_parametros/Archivo/${this.dataUser.logo}`;
    public name:string = `${this.dataUser.nombre_usuario}`;

    @Input() tray: string;
    @Input() path: string;
    @Input() trayName: string;
    @Input() icon: string;

    constructor() { }

    ngOnInit(): void {

    }

}

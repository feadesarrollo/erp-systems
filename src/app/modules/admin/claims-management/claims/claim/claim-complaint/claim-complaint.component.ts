import {ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { takeUntil, Subject, Observable } from 'rxjs';
import { ClaimsService } from "../../claims.service";
import { DOCUMENT } from '@angular/common';
import { MatDialog } from "@angular/material/dialog";
import { ClaimDialogComponent } from "../claim-dialog/claim-dialog.component";
import {Select} from "@ngxs/store";
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";
import {ClaimMailComposeComponent} from "../claim-mail-compose/claim-mail-compose.component";

@Component({
  selector: 'erp-claim-complaint',
  templateUrl: './claim-complaint.component.html'
})
export class ClaimComplaintComponent implements OnInit {

    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getPermissions) permission$: Observable<any>;
    /******************************** STORE ********************************/

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ReclamoForm: FormGroup;

    @Input() reclamo: any;

    public listaTipoIncidente: any;
    public listaSubTipoIncidente: any = [];
    public listaOrigen: any;
    public listaTransito: any;
    public listaDestino: any;

    public listaDenunciado: any;
    public listaRecepcion: any;
    public listaCliente: any;
    public listaMedioReclamo: any;
    public listaMotivoAnulado: any;
    public listaOficinaIncidente: any;
    public listaOficinaRecepcion: any;
    public listaFuncInforme: any;
    public editMode: boolean = false;

    private momento: string;
    public rolesAllowed: any = [];

    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _reclamoService: ClaimsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.permission$.subscribe(permits => {
            if ( permits.permitsClaim?.length > 0 ){
                this.rolesAllowed = permits.permitsClaim.find(perm => perm.states.includes(this.reclamo.estado))?.permission || [];
            }
        });

        this.ReclamoForm = this._formBuilder.group({

            id_reclamo: ['',[Validators.required]],
            id_tipo_incidente: ['',[Validators.required]],
            id_subtipo_incidente: ['',[Validators.required]],
            id_medio_reclamo: ['',[Validators.required]],
            id_funcionario_recepcion: ['',[Validators.required]],
            id_funcionario_denunciado: [''],
            id_oficina_registro_incidente: ['',[Validators.required]],
            id_cliente: ['',[Validators.required]],
            fecha_hora_incidente: ['',[Validators.required]],
            nro_ripat_att: [''],

            nro_hoja_ruta: [''],//

            fecha_hora_recepcion: ['',[Validators.required]],
            fecha_hora_vuelo: ['',[Validators.required]],
            origen: ['',[Validators.required]],
            nro_frd: ['',[Validators.required]],
            correlativo_preimpreso_frd: ['', [Validators.required]],
            transito: ['',[Validators.required]],
            observaciones_incidente: ['',[Validators.required]],
            destino: ['',[Validators.required]],

            nro_pir: [''],//
            nro_frsa: [''],//

            nro_att_canalizado: [''],
            detalle_incidente: ['',[Validators.required]],
            pnr: [''],
            nro_vuelo: ['',[Validators.required]],
            id_oficina_incidente: [''],
            id_motivo_anulado: [''],
            //incidente: [''],
        });

        this.ReclamoForm.disable();
        // Get Reclamos
        this._reclamoService.reclamo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((reclamo: any) => {
                // Get the course
                //this.reclamo = reclamo;
                this.ReclamoForm.patchValue(this.reclamo);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        // Get Tipo Incidente
        this._reclamoService.loadTipoIncidente()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaTipo: any[]) => {
                this.listaTipoIncidente = listaTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._reclamoService.loadSubTipoIncidente(this.reclamo.id_tipo_incidente)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Medio Reclamo
        this._reclamoService.loadMedioReclamo()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any[]) => {
                this.listaMedioReclamo = resp;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get Motivo Anulado
        this._reclamoService.loadMotivoAnulado()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any[]) => {
                this.listaMotivoAnulado = resp;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Update the Reclamo
     */
    updateReclamo(): void
    {
        const reclamo = this.ReclamoForm.value;
        Object.keys(reclamo).forEach(key => {
            if(!reclamo[key]){
                reclamo[key] = '';
            }
        });

        this._reclamoService.guardarReclamo(this.ReclamoForm.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {

            });

        // Toggle the edit mode off
        this.toggleEditMode(false);
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */

    toggleEditMode(editMode: boolean | null = null): void
    {
        this.momento = 'editar';
        const dialogRef = this._matDialog.open(ClaimDialogComponent,{
            height: '75%',
            width: '90%',
            data: {
                claim: this.reclamo,
                momento: this.momento
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }

    /**
     * Open compose dialog
     */
    openComposeDialog(): void
    {
        // Open the dialog
        const dialogRef = this._matDialog.open(ClaimMailComposeComponent, {
            data: {
                claim: this.reclamo
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }

    displayMedio(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayCliente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Get Nombre Oficina Recepcion
     */
    getOficinaRecepcion(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' && this.listaOficinaRecepcion != undefined ){
            return this.listaOficinaRecepcion.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else{
            return this.reclamo.desc_oficina_registro_incidente;
        }
    }

    /**
     * load Oficina
     */
    searchOficina(query: string, tipo: string): void
    {
        this._reclamoService.searchOficina(query).subscribe(
            (resp) => {

                switch (tipo) {
                    case 'recepcion':
                        this.listaOficinaRecepcion = resp;
                        break;
                    case 'incidente':
                        this.listaOficinaIncidente = resp;
                        break;
                    default:
                        this.listaOficinaRecepcion = [];
                        this.listaOficinaIncidente = [];
                }
            }
        );
    }

    /**
     * Get Nombre Funcionario Recepcion
     */
    getFuncRecepcion(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaRecepcion != undefined ) {
            return this.listaRecepcion.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else{
            return this.reclamo.desc_nombre_funcionario;
        }
    }

    /**
     * load Funcionario
     */
    searchFuncionario(query: string, tipo: string): void
    {
        this._reclamoService.searchFuncionario(query).subscribe(
            (listaFuncionario) => {
                //eval('this.lista'+tipo+'='+listaLugar+';');
                switch (tipo) {
                    case 'denunciado':
                        this.listaDenunciado = listaFuncionario;
                        break;
                    case 'recepcion':
                        this.listaRecepcion = listaFuncionario;
                        break;
                    case 'informe':
                        this.listaFuncInforme = listaFuncionario;
                        break;
                    default:
                        this.listaDenunciado = [];
                        this.listaRecepcion = [];
                        this.listaFuncInforme = [];
                }
            }
        );
    }

    /**
     * load Cliente
     */
    searchCliente(query: string): void
    {
        this._reclamoService.searchCliente(query).subscribe(
            (listaCliente) => {
                this.listaCliente = listaCliente;
            }
        );
    }

    /**
     * Get Nombre Cliente
     */
    getCliente(id_cliente: string) {
        if ( id_cliente !== null && id_cliente !== undefined && id_cliente !== '' && this.listaCliente != undefined ) {
            return this.listaCliente.find(cliente => cliente.id_cliente === id_cliente).nombre_completo2;
        }else{
            return this.reclamo.desc_nom_cliente;
        }
    }

    /**
     * Filter por lugar
     *
     * @param change
     */
    searchLugar(query: string, tipo: string): void
    {
        this._reclamoService.searchLugar(query).subscribe(
            (listaLugar) => {
                //eval('this.lista'+tipo+'='+listaLugar+';');
                switch (tipo) {
                    case 'origen':
                        this.listaOrigen = listaLugar;
                        break;
                    case 'transito':
                        this.listaTransito = listaLugar;
                        break;
                    case 'destino':
                        this.listaDestino = listaLugar;
                        break;
                    default:
                        this.listaDestino = [];
                }
            }
        );
    }

    /**
     * Get Nombre Funcionario Denunciado
     */
    getFuncDenunciado(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaDenunciado != undefined ){
            return this.listaDenunciado.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else{
            return this.reclamo.desc_nombre_fun_denun;
        }
    }

    /**
     * Get Nombre Oficina Incidente
     */
    getOficinaIncidente(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' && this.listaOficinaIncidente != undefined){
            return this.listaOficinaIncidente.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else{
            return this.reclamo.desc_nombre_oficina;
        }
    }

    displaySubIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }
    /**
     * Change value Tipo Incidente
     */
    onTipoIncidenteChange(ev){
        // Get Tipo Incidente
        this._reclamoService.loadSubTipoIncidente(ev.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

}

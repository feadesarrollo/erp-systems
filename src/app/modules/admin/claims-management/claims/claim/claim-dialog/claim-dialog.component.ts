import {
    ChangeDetectorRef,
    Component,
    OnInit,
    AfterViewChecked,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    Inject, ViewChild, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClaimsService } from '../../claims.service';
import { Subject, takeUntil, fromEvent } from 'rxjs';
import {  map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { BobyConfirmationService } from "../../../../../../../@boby/services/confirmation";
import {CustomerDialogComponent} from "../../../settings/customer/customer-dialog/customer-dialog.component";

@Component({
    selector: 'erp-claim-dialog',
    templateUrl: './claim-dialog.component.html',
    styleUrls: ['./claim-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimDialogComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

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

    ReclamoForm: FormGroup;

    private showMessage : string;
    private configForm: FormGroup;

    private claim: any;
    public momento: string;

    public categoryList: any = [];
    /************** DATE TIME PICKER ******************/
    public date: moment.Moment;
    public disabled = false;
    public showSpinners = true;
    public showSeconds = true;
    public touchUi = false;
    public enableMeridian = false;
    public minDate: moment.Moment;
    public maxDate: moment.Moment;
    public stepHour = 1;
    public stepMinute = 1;
    public stepSecond = 1;
    public color: ThemePalette = 'primary';
    public defaultTime = [0,0,0];
    /************** DATE TIME PICKER ******************/

    @ViewChild('numberFRD') numberFRD: ElementRef;

    status: string = 'form';
    name: string = 'form';
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _reclamoService: ClaimsService,
        public matDialogRef: MatDialogRef<ClaimDialogComponent>,
        private _fcService: BobyConfirmationService,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.claim = this._data.claim;
        this.momento = this._data.momento;
        this.showMessage = this.momento == 'nuevo' ? 'crear' : 'modificar';

        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de ${this.showMessage} el registro.`,
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        // Get Tipo Incidente
        this._reclamoService.loadTipoIncidente()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaTipo: any[]) => {
                this.listaTipoIncidente = listaTipo;
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

        this._reclamoService.getCategoryList('cr')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: any[]) => {
                this.categoryList = categories;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if ( this._data.momento == 'nuevo' ){

            const dataUser = JSON.parse(localStorage.getItem('aut')).nombre_usuario;
            this._reclamoService.searchFuncionario(dataUser).subscribe(
                (lists) => {
                    this.listaRecepcion = lists;
                    this.ReclamoForm.get('step1').get('id_funcionario_recepcion').setValue(this.listaRecepcion[0].id_funcionario)

                }
            );

            this._reclamoService.getOfficeData().subscribe(
                (resp: any) => {
                    this.listaOficinaRecepcion = [{id_oficina:resp.id_oficina, nombre:resp.oficina_nombre}];
                    this.ReclamoForm.get('step1').get('id_oficina_registro_incidente').setValue(resp.id_oficina);
                    this.ReclamoForm.get('step1').get('nro_frd').setValue(resp.v_frd);
                }
            );

            this.ReclamoForm = this._formBuilder.group({
                step1: this._formBuilder.group({
                    id_cliente: ['',[Validators.required]],
                    id_medio_reclamo: ['',[Validators.required]],
                    id_funcionario_recepcion: ['',[Validators.required]],
                    id_oficina_registro_incidente: ['',[Validators.required]],
                    fecha_hora_recepcion: ['',[Validators.required]],
                    nro_frd: ['',[Validators.required, Validators.pattern(/^[0-9]\d*$/)]]
                }),

                step2: this._formBuilder.group({
                    nro_vuelo: [''/*,[Validators.required]*/],
                    pnr: [''/*,[Validators.pattern(/^[0-9]\d*$/)]*/],
                    origen: [''/*,[Validators.required]*/],
                    transito: [''/*,[Validators.required]*/],
                    destino: [''/*,[Validators.required]*/],
                    fecha_hora_vuelo: [''/*,[Validators.required]*/],
                }),

                step3: this._formBuilder.group({
                    id_tipo_incidente: ['',[Validators.required]],
                    id_subtipo_incidente: ['',[Validators.required]],
                    id_oficina_incidente: [''],
                    detalle_incidente: ['',[Validators.required]],
                    observaciones_incidente: ['Ninguna.',[Validators.required]],
                    fecha_hora_incidente: ['',[Validators.required]],

                    id_motivo_anulado: [''],
                    id_funcionario_denunciado: ['']
                }),
                step4: this._formBuilder.group({
                    correlativo_preimpreso_frd: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
                    nro_att_canalizado: ['',[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_ripat_att: ['',[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_hoja_ruta: ['',[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_pir: ['',[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_frsa: ['',[Validators.pattern(/^[0-9]\d*$/)]],
                    category: ['']
                })
            });
        }else if ( this._data.momento == 'editar' ){
            this.ReclamoForm = this._formBuilder.group({
                step1: this._formBuilder.group({
                    id_reclamo: [this.claim.id_reclamo,[Validators.required]],
                    id_cliente: [this.claim.id_cliente,[Validators.required]],
                    id_medio_reclamo: [this.claim.id_medio_reclamo,[Validators.required]],
                    id_funcionario_recepcion: [this.claim.id_funcionario_recepcion,[Validators.required]],
                    id_oficina_registro_incidente: [this.claim.id_oficina_registro_incidente,[Validators.required]],
                    fecha_hora_recepcion: [this.claim.fecha_hora_recepcion,[Validators.required]],
                    nro_frd: [this.claim.nro_frd,[Validators.required, Validators.pattern(/^[0-9]\d*$/)]]
                }),

                step2: this._formBuilder.group({
                    nro_vuelo: [this.claim.nro_vuelo,[Validators.required]],
                    pnr: [this.claim.pnr,[Validators.pattern(/^[0-9]\d*$/)]],
                    origen: [this.claim.origen/*,[Validators.required]*/],
                    transito: [this.claim.transito/*,[Validators.required]*/],
                    destino: [this.claim.destino,/*[Validators.required]*/],
                    fecha_hora_vuelo: [this.claim.fecha_hora_vuelo,[Validators.required]],
                }),

                step3: this._formBuilder.group({
                    id_tipo_incidente: [this.claim.id_tipo_incidente,[Validators.required]],
                    id_subtipo_incidente: [this.claim.id_subtipo_incidente,[Validators.required]],
                    id_oficina_incidente: [this.claim.id_oficina_incidente],
                    detalle_incidente: [this.claim.detalle_incidente,[Validators.required]],
                    observaciones_incidente: [this.claim.observaciones_incidente,[Validators.required]],
                    fecha_hora_incidente: [this.claim.fecha_hora_incidente,[Validators.required]],
                    id_motivo_anulado: [this.claim.id_motivo_anulado],
                    id_funcionario_denunciado: [this.claim.id_funcionario_denunciado]
                }),

                step4: this._formBuilder.group({
                    correlativo_preimpreso_frd: [this.claim.correlativo_preimpreso_frd, [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
                    nro_att_canalizado: [this.claim.nro_att_canalizado,[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_ripat_att: [this.claim.nro_ripat_att,[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_hoja_ruta: [this.claim.nro_hoja_ruta,[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_pir: [this.claim.nro_pir,[Validators.pattern(/^[0-9]\d*$/)]],
                    nro_frsa: [this.claim.nro_frsa,[Validators.pattern(/^[0-9]\d*$/)]],
                    category: [this.claim.category]
                })
            });

            if ( this._data.fields?.length ){
                this._data.fields.map(item =>  {
                    if (item.nombre_columna == 'nro_ripat_att' && item.momento == 'exigir'){
                        this.ReclamoForm.get('step4').get('nro_ripat_att').setValidators([Validators.required]);
                    }
                })

            }

            this._reclamoService.loadSubTipoIncidente(this.claim.id_tipo_incidente)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((listaSubTipo: any[]) => {
                    this.listaSubTipoIncidente = listaSubTipo;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

        }
    }

    ngAfterViewChecked() {
        this._changeDetectorRef.detectChanges();
    }

    ngAfterViewInit() {
        fromEvent(this.numberFRD.nativeElement, 'input')
            .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
            .pipe(debounceTime(3000))
            .pipe(distinctUntilChanged())
            .subscribe(data => {
                if ( this.momento == 'nuevo' ){

                    const params = {frd:data,id_gestion:this._data.selectedYear.id_gestion,id_oficina_registro_incidente: this.ReclamoForm.get('step1').get('id_oficina_registro_incidente').value};

                    this._reclamoService.validateFRD(params).subscribe(
                        ( response: any ) => {
                            if ( JSON.parse(response.data.exists) ) {
                                // Build the config form
                                this.configForm = this._formBuilder.group({
                                    title: 'Alerta',
                                    message: `Estimado Usuario, ya existe el numero FRD ${data} registrado en el punto ${this.getOficinaRecepcion(this.ReclamoForm.get('step1').get('id_oficina_registro_incidente').getRawValue())}.`,
                                    icon: this._formBuilder.group({
                                        show: true,
                                        name: 'heroicons_outline:exclamation',
                                        color: 'warn'
                                    }),
                                    actions: this._formBuilder.group({
                                        confirm: this._formBuilder.group({
                                            show: true,
                                            label: 'Confirmar',
                                            color: 'warn'
                                        }),
                                        cancel: this._formBuilder.group({
                                            show: false,
                                            label: 'Cancelar'
                                        })
                                    }),
                                    dismissible: true
                                });

                                const dialogRef = this._fcService.open(this.configForm.value);

                                // Subscribe to afterClosed from the dialog reference
                                dialogRef.afterClosed().subscribe((result) => {

                                });
                            }
                        }
                    );
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
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

    /**
     * load Lugares
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
                    default:
                        this.listaDenunciado = [];
                        this.listaRecepcion = [];
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
     * Change value medio reclamo
     */
    onMedioReclamoChange(ev){
        // Get Tipo Incidente
        this._reclamoService.loadSubTipoIncidente(ev.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Change value motivo anulado
     */
    onMotivoAnuladoChange(ev){
        // Get Tipo Incidente
        this._reclamoService.loadSubTipoIncidente(ev.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listaSubTipo: any[]) => {
                this.listaSubTipoIncidente = listaSubTipo;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * close
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }
    /**
     * Save Reclamo
     */
    guardarReclamo()
    {
        this.ReclamoForm.get('step1').get('fecha_hora_recepcion').setValue(moment/*.utc*/(this.ReclamoForm.get('step1').get('fecha_hora_recepcion').value).format('DD/MM/YYYY HH:mm:ss'));
        this.ReclamoForm.get('step2').get('fecha_hora_vuelo').setValue(moment/*.utc*/(this.ReclamoForm.get('step2').get('fecha_hora_vuelo').value).format('DD/MM/YYYY HH:mm:ss'));
        this.ReclamoForm.get('step3').get('fecha_hora_incidente').setValue(moment/*.utc*/(this.ReclamoForm.get('step3').get('fecha_hora_incidente').value).format('DD/MM/YYYY HH:mm:ss'));

        this._reclamoService.guardarReclamo(this.ReclamoForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.matDialogRef.close(this.ReclamoForm.getRawValue());
            });

    }

    /**
     * Get Nombre Cliente
     */
    getCliente(id_cliente: string) {
        if ( this._data.momento == 'nuevo' ) {
            if (id_cliente !== null && id_cliente !== undefined && id_cliente !== '') {
                if (this.status == 'new') {
                    return this.name;
                }else{
                    return this.listaCliente.find(cliente => cliente.id_cliente === id_cliente).nombre_completo2;
                }
            }
        }else if( this._data.momento == 'editar' ){
            if( this.listaCliente != undefined ) {
                const customerName = this.listaCliente.find(cliente => cliente.id_cliente === id_cliente).nombre_completo2;
                if (customerName !== this.claim.desc_nom_cliente) {
                    return customerName;
                } else {
                    return this.claim.desc_nom_cliente;
                }
            }else{
                return this.claim.desc_nom_cliente;
            }
        }
    }

    /**
     * Get Nombre Funcionario Recepcion
     */
    getFuncRecepcion(id_funcionario: string) {
        if ( this._data.momento == 'nuevo' ) {
            if (id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '')
                return this.listaRecepcion.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else if( this._data.momento == 'editar' ){
            if( this.listaRecepcion != undefined ) {
                const officialName = this.listaRecepcion.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
                if ( officialName !== this.claim.desc_nombre_funcionario ) {
                    return officialName;
                } else {
                    return this.claim.desc_nombre_funcionario;
                }
            }else {
                return this.claim.desc_nombre_funcionario;
            }
        }
    }

    /**
     * Get Nombre Funcionario Denunciado
     */
    getFuncDenunciado(id_funcionario: string) {
        if ( this._data.momento == 'nuevo' ) {
            if (id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '')
                return this.listaDenunciado.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
        }else if( this._data.momento == 'editar' ){
            return this.claim.desc_nombre_fun_denun;
        }
    }

    /**
     * Get Nombre Oficina Incidente
     */
    getOficinaIncidente(id_oficina: string) {

        if ( this._data.momento == 'nuevo' ) {
            if (id_oficina !== null && id_oficina !== undefined && id_oficina !== '')
                return this.listaOficinaIncidente.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else if( this._data.momento == 'editar' ){
            if( this.listaOficinaIncidente != undefined ) {
                const incidentName = this.listaOficinaIncidente.find(oficina => oficina.id_oficina === id_oficina).nombre;
                if ( incidentName !== this.claim.desc_nombre_oficina ) {
                    return incidentName;
                } else {
                    return this.claim.desc_nombre_oficina;
                }
            }else {
                return this.claim.desc_nombre_oficina;
            }
        }
    }

    /**
     * Get Nombre Oficina Recepcion
     */
    getOficinaRecepcion(id_oficina: string) {
        console.warn('getOficinaRecepcion',id_oficina);
        if ( this._data.momento == 'nuevo' ) {
            if (id_oficina !== null && id_oficina !== undefined && id_oficina !== '')
                return this.listaOficinaRecepcion.find(oficina => oficina.id_oficina === id_oficina).nombre;
        }else if( this._data.momento == 'editar' ){

            if( this.listaOficinaRecepcion != undefined ) {
                const receptionName = this.listaOficinaRecepcion.find(oficina => oficina.id_oficina === id_oficina).nombre;
                if ( receptionName !== this.claim.desc_oficina_registro_incidente ) {
                    return receptionName;
                } else {
                    return this.claim.desc_oficina_registro_incidente;
                }
            }else {
                return this.claim.desc_oficina_registro_incidente;
            }
        }
    }

    displayIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displaySubIncidente(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayMedio(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    newClient(){
        const dialogRef = this._matDialog.open(CustomerDialogComponent,{
            data: {}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this.ReclamoForm.get('step1').get('id_cliente').setValue(result.response.data.id_cliente);
                this.status = result.response.data.v_momento;
                this.name = result.customer.apellido_paterno+' '+result.customer.apellido_materno+' '+result.customer.nombre;
            });
    }

    validateFRD(frd){

        const params = {frd,id_gestion:this._data.selectedYear.id_gestion,id_oficina_registro_incidente: this.ReclamoForm.get('step1').get('id_oficina_registro_incidente').value};

        this._reclamoService.validateFRD(params).subscribe(
            ( response: any ) => {

                // Build the config form
                this.configForm = this._formBuilder.group({
                    title: 'Alerta',
                    message: `Estimado Usuario, ya existe el numero FRD ${frd} registrado en la oficina ${this.ReclamoForm.get('step1').get('id_oficina_registro_incidente').getRawValue()}.`,
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: 'Confirmar',
                            color: 'warn'
                        }),
                        cancel: this._formBuilder.group({
                            show: false,
                            label: 'Cancelar'
                        })
                    }),
                    dismissible: true
                });

                const dialogRef = this._fcService.open(this.configForm.value);

                // Subscribe to afterClosed from the dialog reference
                dialogRef.afterClosed().subscribe((result) => {

                });
            }
        );
    }

}

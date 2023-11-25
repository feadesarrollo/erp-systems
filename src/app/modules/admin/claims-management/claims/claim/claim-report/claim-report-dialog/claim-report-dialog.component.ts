import {
    ChangeDetectorRef,
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ViewChild, ElementRef
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { Subject, takeUntil, fromEvent } from 'rxjs';
import { ClaimsService } from "../../../claims.service";
import { ClaimReportService } from "../claim-report.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import * as moment from "moment";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";
import {debounceTime, distinctUntilChanged, map} from "rxjs/operators";


@Component({
    selector: 'erp-claim-report-dialog',
    templateUrl: './claim-report-dialog.component.html',
    styleUrls: ['./claim-report-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimReportDialogComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public InformeForm: FormGroup;
    public listaFuncInforme: any;
    public listaCompensacion: any;
    showMessage : string;
    configForm: FormGroup;

    public content: string = '';
    public searchInputControl: FormControl = new FormControl();
    public title;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _reclamoService: ClaimsService,
        private _informeService: ClaimReportService,
        public matDialogRef: MatDialogRef<ClaimReportDialogComponent>,
        private _fcService: BobyConfirmationService) { }

    ngOnInit(): void {

        this.showMessage = this._data.momento == 'nuevo' ? 'crear' : 'modificar';
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

        if ( this._data.momento == 'editar' ) {
            this.title = 'EDITAR INFORME';
            this.InformeForm = this._formBuilder.group({
                id_reclamo: [this._data.informe.id_reclamo,[Validators.required]],
                id_informe: [this._data.informe.id_informe,[Validators.required]],
                nro_informe: [{value: this._data.informe.nro_informe, disabled: true},[Validators.required]],
                fecha_informe: ['',[Validators.required]],
                id_funcionario: ['',[Validators.required]],
                lista_compensacion: [[]],
                antecedentes_informe: [''],
                analisis_tecnico: [''],
                conclusion_recomendacion: [''],
                sugerencia_respuesta: [''],
                content: ['']
            });

            this._data.informe.lista_compensacion =this._data.informe.lista_compensacion.split(',');
            this.InformeForm.patchValue(this._data.informe);
        }else if (this._data.momento == 'nuevo' ){

            this.InformeForm = this._formBuilder.group({
                id_reclamo: [this._data.reclamo.id_reclamo,[Validators.required]],
                nro_informe: [{value: this._data.reclamo.nro_tramite, disabled: true},[Validators.required]],
                fecha_informe: ['',[Validators.required]],
                id_funcionario: ['',[Validators.required]],
                lista_compensacion: [[]],
                antecedentes_informe: [''],
                analisis_tecnico: [''],
                conclusion_recomendacion: [''],
                sugerencia_respuesta: [''],
                content: ['']
            });

            this.title = 'NUEVO INFORME';
            this._reclamoService.getTemplateById(this._data.reclamo.id_tipo_incidente,'informe')
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((content: any) => {
                    //this.content = content;

                    this.InformeForm.get('content').setValue(content);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            const dataUser = JSON.parse(localStorage.getItem('aut')).nombre_usuario;
            this._reclamoService.searchFuncionario(dataUser).subscribe(
                (lists) => {
                    this.listaFuncInforme = lists;
                    this.InformeForm.get('id_funcionario').setValue(this.listaFuncInforme[0].id_funcionario)

                }
            );
        }

        this._reclamoService.loadCompensacion()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((compensacion: any[]) => {
                this.listaCompensacion = compensacion;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit() {
        /*fromEvent(this.contents.nativeElement, 'input')
            .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
            .pipe(debounceTime(3000))
            .pipe(distinctUntilChanged())
            .subscribe(data => {

            });*/
    }

    /**
     * Save Informe
     */
    saveInforme()
    {
        const dialogRef = this._fcService.open(this.configForm.value);
        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if ( result == 'confirmed' ){

                const informe = this.InformeForm.getRawValue();

                Object.keys(this.InformeForm.getRawValue()).forEach(key => {
                    if(!informe[key]){
                        informe[key] = '';
                    }

                    if(key == 'lista_compensacion'){
                        informe[key] = informe[key].toString();
                    }

                    if(key == 'fecha_informe'){
                        informe[key] = moment.utc(informe.fecha_informe).format('DD/MM/YYYY');
                    }
                });

                if (this._data.momento == 'editar'){

                    this._informeService.createInforme(informe)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            this.matDialogRef.close(this.InformeForm.value);
                        });

                }else if ( this._data.momento == 'nuevo' ){

                    this._informeService.createInforme(informe)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            this.matDialogRef.close(this.InformeForm.value);
                        });

                }


            }else{
                this.matDialogRef.close(this.InformeForm.value);
            }
        });
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
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
                    case 'informe':
                        this.listaFuncInforme = listaFuncionario;
                        break;
                    default:
                        this.listaFuncInforme = [];
                }
            }
        );
    }

    /**
     * Get Nombre Funcionario Informe
     */
    getFuncInforme(id_funcionario: string) {

        if ( this._data.momento == 'nuevo' ) {
            if (id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' && this.listaFuncInforme != undefined) {
                return this.listaFuncInforme.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
            }
        }else if( this._data.momento == 'editar' ){
            return this._data.informe.desc_fun;
        }
    }

}

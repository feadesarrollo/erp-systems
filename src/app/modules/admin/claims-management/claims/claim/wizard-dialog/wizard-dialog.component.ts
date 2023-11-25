import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { ClaimsService } from '../../claims.service';
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {AddSelectedYear, AddYear} from "../../../../../../../store/claims-management/claims-management.actions";

@Component({
    selector: 'erp-wizard-dialog',
    templateUrl: './wizard-dialog.component.html',
    styleUrls: ['./wizard-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardDialogComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public WizardForm: FormGroup;

    public listaTipoEstado: any;
    public listaFuncionarioWf: any;
    public listaDepartamentoWf: any;
    public showProcess: boolean = false;
    public processName: string = '';

    public listaTipoEstadoP: any = [];
    public listaFuncionarioWfP: any = [];
    public listaDepartamentoWfP: any = [];
    private endpoint: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _reclamoS: ClaimsService,
        public matDialogRef: MatDialogRef<WizardDialogComponent>) { }

    ngOnInit(): void {

        this.WizardForm = this._formBuilder.group({
            estado: this._formBuilder.group({
                id_proceso_wf_act: [this._data.id_proceso_wf,[Validators.required]],
                id_estado_wf_act: [this._data.id_estado_wf,[Validators.required]],
                id_tipo_estado: ['',[Validators.required]],
                id_funcionario_wf: [''/*{value: '', disabled: true}*/],
                id_depto_wf: [''/*{value: '', disabled: true}*/],
                obs: [''/*,[Validators.required]*/],
                json_procesos: [[]],
            }),
            proceso: this._formBuilder.group({
                id_proceso_wf_act: [this._data.id_proceso_wf,[Validators.required]],
                id_estado_wf_act: [this._data.id_estado_wf,[Validators.required]],
                id_tipo_estado: ['',[Validators.required]],
                id_funcionario_wf: [''/*{value: '', disabled: true}*/],
                id_depto_wf: [''/*{value: '', disabled: true}*/],
                obs: [{value: '', disabled: true}],
                json_procesos: [[]],
            })

        });

        this.endpoint = this._data.endpoint;

        this._reclamoS.checkSiguienteEstado(this._data.id_proceso_wf)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (!response.error && response.data.error_validacion_campos == 'no' && response.data.error_validacion_documentos == 'no' ){
                    this._reclamoS.loadTipoEstado(response.data)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((tipoEstado: any) => {
                            this.listaTipoEstado = tipoEstado;
                        });
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * Change estado wizard
     */
    onChangeWizard(momento: string)
    {
        this.WizardForm.get('estado').get('json_procesos').setValue( '[]');
        if ( momento == 'estado' ) {
            this._reclamoS.onChangeWizard(this.WizardForm.get('estado').getRawValue(), this.endpoint)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {
                    this.matDialogRef.close(response);
                });
        }else if ( momento == 'proceso' ){
            this._reclamoS.onChangeWizard(this.WizardForm.get('estado').getRawValue(), this.endpoint)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {
                    this.matDialogRef.close(response);
                });

        }
    }

    /**
     * Close dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    /**
     * Change value siguiente estado
     */
    changeSiguienteEstado(ev){

        this._reclamoS.onSiguienteEstado(this._data.id_proceso_wf, ev.value)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((root: any) => {
                if ( !root.error ) {
                    const procesos = JSON.parse(root.data.json_procesos.replace(/['']+/g, '"'));

                    this.WizardForm.get('estado').get('json_procesos').setValue(procesos || []);

                    if (this.WizardForm.get('estado').get('json_procesos').value.length > 0){
                        this.showProcess = true;
                        this.processName = `[${procesos[0].codigo}] ${procesos[0].nombre}`;
                    }else{
                        this.showProcess = false;
                    }

                    const selectedState = this.listaTipoEstado.find(item => item.id_tipo_estado === ev.value);

                    this.WizardForm.get('estado').get('id_funcionario_wf').reset();
                    this.WizardForm.get('estado').get('id_depto_wf').reset();

                    if (selectedState.tipo_asignacion != 'ninguno'){

                        this._reclamoS.loadFuncionarioWf({
                            id_estado_wf: this._data.id_estado_wf,
                            id_tipo_estado: ev.value
                        }).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((funcionarioWf: any) => {
                                this.listaFuncionarioWf = funcionarioWf;
                                this.WizardForm.get('estado').get('id_funcionario_wf').enable();

                                if ( this.listaFuncionarioWf.length === 1 ){
                                    this.WizardForm.get('estado').get('id_funcionario_wf').setValue(this.listaFuncionarioWf[0].id_funcionario);
                                }
                            });

                    }else{
                        this.WizardForm.get('estado').get('id_funcionario_wf').disable();
                    }

                    if (selectedState.depto_asignacion != 'ninguno'){

                        this._reclamoS.loadDepartamentoWf({
                            id_estado_wf: this._data.id_estado_wf,
                            id_tipo_estado: ev.value
                        }).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((funcionarioWf: any) => {
                                this.listaDepartamentoWf = funcionarioWf;
                                //this.WizardForm.controls['id_depto_wf'].reset();

                                this.WizardForm.get('estado').get('id_depto_wf').enable();

                                if ( this.listaDepartamentoWf.length === 1 ){
                                    this.WizardForm.get('estado').get('id_depto_wf').setValue(this.listaDepartamentoWf[0].id_depto);
                                }
                            });

                    }else{
                        this.WizardForm.get('estado').get('id_depto_wf').disable();
                    }

                    if (this.WizardForm.get('estado').get('json_procesos').value.length > 0){

                        /*this._reclamoS.checkSiguienteEstado(this._data.id_proceso_wf)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((response: any) => {
                                if (!response.error && response.data.error_validacion_campos == 'no' && response.data.error_validacion_documentos == 'no' ){
                                    this._reclamoS.loadTipoEstado(response.data)
                                        .pipe(takeUntil(this._unsubscribeAll))
                                        .subscribe((tipoEstado: any) => {
                                            this.listaTipoEstadoP = tipoEstado;
                                        });
                                }
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });*/

                        this._reclamoS.loadTipoEstadoProceso(procesos[0])
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((process: any) => {
                                this.listaTipoEstadoP = process;
                                this.WizardForm.get('proceso').get('id_tipo_estado').setValue(process[0].id_tipo_estado);
                                this._changeDetectorRef.markForCheck();

                            });
                    }
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Change value funcionario workflow
     */
    changeFuncionarioWf(ev){

        /*this._reclamoS.changeFuncionarioWf(this._data.id_proceso_wf)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((root: any) => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });*/
    }

    /**
     * Change value departamento workflow
     */
    changeDepartamentoWf(ev){

        /*this._reclamoS.changeFuncionarioWf(this._data.id_proceso_wf)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((root: any) => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });*/
    }

}

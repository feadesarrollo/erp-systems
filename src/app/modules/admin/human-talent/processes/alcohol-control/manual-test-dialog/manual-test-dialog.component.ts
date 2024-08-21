import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HumanTalentService} from "../../../human-talent.service";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {ClaimFilesService} from "../../../../claims-management/claims/claim/claim-files/claim-files.service";
import {MessageService} from "primeng/api";
import * as moment from "moment";
import {ClaimsService} from "../../../../claims-management/claims/claims.service";

@Component({
  selector: 'erp-manual-registration-dialog',
  templateUrl: './manual-test-dialog.component.html',
  styleUrls: ['./manual-test-dialog.component.scss']
})
export class ManualTestDialogComponent implements OnInit {

    public TestForm: FormGroup;

    public testTypeList;

    configForm: FormGroup;
    public imageSrc:any = '';
    public selectionChange:string = 'negativo';
    private file:any = '';
    public processing: boolean = false;
    public listOfficials: any = [];
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _htService: HumanTalentService,
        private _fcService: BobyConfirmationService,
        public matDialogRef: MatDialogRef<ManualTestDialogComponent>,
        private _archivoS: ClaimFilesService,
        private _messageService: MessageService,
        private _claimService: ClaimsService
    ) { }

    ngOnInit(): void {

        this.TestForm = this._formBuilder.group({
            official: ['', Validators.required],
            //testdate: [moment().add(1, 'days').format('YYYY-MM-DD'), Validators.required],
            testdate: [new Date(), Validators.required],
            testtype: ['Alcohol', Validators.required],
            result: ['negativo', Validators.required],
            testconfirm: ['']
        });

        this._htService.getTestType().subscribe(
            (resp: any) => {
                this.testTypeList = resp.testTypeList;
                /*if ( this._data.status == 'edit' ) {
                    if ( this._data.selectedOfficial.result != '' ){
                        this.TestForm.patchValue(this._data.selectedOfficial);
                    }else{*/
                        this.TestForm.get('testconfirm').setValue('No se realizo');
                    /*}

                }*/
            }
        );



    }

    onSelectionChange(event){
        this.selectionChange = event.value;
        if ( event.value == 'positivo' ){

        }
    }

    onFileChange(fileList: FileList){
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        this.file = fileList[0];

        // Return if the file is not allowed
        if ( !allowedTypes.includes(this.file.type) )
        {

            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `<p class="font-bold">Estimado Usuario:<br> El formato ${this.file.type} no esta permitido.</p>`,
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'Aceptar',
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

            dialogRef.afterClosed().subscribe((result) => {

            });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = () => {
            this.imageSrc = reader.result;
        };

    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    postManualTest(){

        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de completar el registro.`,
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

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if ( result == 'confirmed' ){
                const testOfficial = this.TestForm.value;
                Object.keys(this.TestForm.value).forEach(key => {
                    if(!testOfficial[key]){
                        testOfficial[key] = '';
                    }
                });
                this.processing = true;
                this._changeDetectorRef.markForCheck();
                this._htService.postManualTest(testOfficial, this.TestForm.get('official').value, this.file, this.imageSrc).subscribe(
                    (resp: any) => {
                        this.processing = false;
                        this._changeDetectorRef.markForCheck();
                        if ( resp.error ){
                            this.matDialogRef.close(resp);
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        } else {
                            this.matDialogRef.close(resp);
                        }
                    },
                    (error: any) =>{
                        console.error('error',error);
                    }
                );
            }
        });

    }

    /**
     * Search Official
     */
    searchOfficial(query: string): void
    {
        this._claimService.searchFuncionario(query).subscribe(
            (lists) => {
                this.listOfficials = lists;
            }
        );
    }

    /**
     * Get Official Name
     */
    getOfficialName(id_funcionario: string) {
        if (id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '')
            return this.listOfficials.find(off => off.id_funcionario === id_funcionario).desc_funcionario2;
    }

}

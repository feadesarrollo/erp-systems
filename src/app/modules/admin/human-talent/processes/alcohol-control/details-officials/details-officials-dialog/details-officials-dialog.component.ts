import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HumanTalentService} from "../../../../human-talent.service";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";
import {MatTableDataSource} from "@angular/material/table";
import * as moment from "moment";
import {ClaimFilesService} from "../../../../../claims-management/claims/claim/claim-files/claim-files.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'erp-details-officials-dialog',
    templateUrl: './details-officials-dialog.component.html',
    styleUrls: ['./details-officials-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsOfficialsDialogComponent implements OnInit {

    public TestForm: FormGroup;

    public testTypeList;

    configForm: FormGroup;
    public imageSrc:any = '';
    public selectionChange:string = 'negativo';
    private file:any = '';
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _htService: HumanTalentService,
        private _fcService: BobyConfirmationService,
        public matDialogRef: MatDialogRef<DetailsOfficialsDialogComponent>,
        private _archivoS: ClaimFilesService,
        private _messageService: MessageService
    ) { }

    ngOnInit(): void {

        this.TestForm = this._formBuilder.group({
            testdate: ['', Validators.required],
            testtype: ['', Validators.required],
            result: ['', Validators.required],
            /*fileTest: ['', Validators.required],*/
            testconfirm: ['']
        });

        this._htService.getTestType().subscribe(
            (resp: any) => {
                this.testTypeList = resp.testTypeList;
                if ( this._data.status == 'edit' ) {
                    if ( this._data.selectedOfficial.result != '' ){
                        //this._data.selectedOfficial.testdate = moment.utc(new Date(this._data.selectedOfficial.testdate));
                        this.TestForm.patchValue(this._data.selectedOfficial);
                    }else{
                        this.TestForm.get('testconfirm').setValue('No se realizo');
                    }

                }
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

    completeDetail(){

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
                    /*if (['testdate'].includes(key)) {
                        testOfficial[key] = moment/!*.utc*!/(testOfficial[key]).format('YYYY-MM-DD');
                    }*/
                });
                this._htService.postTestOfficial(testOfficial, this._data.selectedOfficial, this.file, this.imageSrc).subscribe(
                    (resp) => {

                        if ( resp.error ){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        } else {
                            this.matDialogRef.close(resp);
                        }

                    }
                );
            }/*else{
                this.matDialogRef.close(this.TestTypeForm.value);
            }*/
        });

    }
}

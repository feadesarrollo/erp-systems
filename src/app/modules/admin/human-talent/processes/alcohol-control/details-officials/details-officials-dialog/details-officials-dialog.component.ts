import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HumanTalentService} from "../../../../human-talent.service";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";
import {MatTableDataSource} from "@angular/material/table";
import * as moment from "moment";
import {ClaimFilesService} from "../../../../../claims-management/claims/claim/claim-files/claim-files.service";
import {MessageService} from "primeng/api";
import {BobyLoadingService} from "@boby/services/loading";

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
    public processing: boolean = false;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _htService: HumanTalentService,
        private _fcService: BobyConfirmationService,
        public matDialogRef: MatDialogRef<DetailsOfficialsDialogComponent>,
        private _archivoS: ClaimFilesService,
        private _messageService: MessageService,
        private _loadService: BobyLoadingService,
    ) { }

    ngOnInit(): void {
        const date  = this._data.information.date.split('/');
        //moment(this._data.information.date,'DD/MM/YYYY').add(1, 'days').format('YYYY-MM-DD')
        this.TestForm = this._formBuilder.group({
            testdate: [new Date(+date[2], date[1] - 1, +date[0]), Validators.required],
            testtype: ['Alcohol', Validators.required],
            result: ['negativo', Validators.required],
            testconfirm: ['No se realizo']
        });
        this._changeDetectorRef.markForCheck();

        this._htService.getTestType().subscribe(
            (resp: any) => {
                this.testTypeList = resp.testTypeList;
                if ( this._data.status == 'edit' ) {
                    if ( this._data.selectedOfficial.tests != null ){
                        //this._data.selectedOfficial.testdate = moment.utc(new Date(this._data.selectedOfficial.testdate));
                        this.TestForm.patchValue(this._data.selectedOfficial.tests);
                    }else{
                        this.TestForm.get('testconfirm').setValue('No se realizo');
                    }

                }
            }
        );



    }

    onSelectionChange(event){
        this.selectionChange = event.value;
        if ( event.value == 'negativo' ){
            //this.imageSrc = '';
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

        reader.onloadstart = () => {
            this._loadService.show();
        };

        reader.onload = () => {
            this.imageSrc = reader.result;
        };

        reader.onloadend = () => {
            this._loadService.hide();
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
                this.processing = true;
                this._changeDetectorRef.markForCheck();
                this._htService.postTestOfficial(testOfficial, this._data.selectedOfficial, this.file, this.imageSrc, this._data.id_control_sorteo_prueba,this._data.id).subscribe(
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
            }/*else{
                this.matDialogRef.close(this.TestTypeForm.value);
            }*/
        });

    }
}

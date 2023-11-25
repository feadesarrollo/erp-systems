import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HumanTalentService} from "../../../../human-talent.service";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";
import {ClaimFilesService} from "../../../../../claims-management/claims/claim/claim-files/claim-files.service";
import {BobyMockApiUtils} from "@boby/lib/mock-api";
import * as moment from 'moment';
@Component({
  selector: 'erp-officials-psychoactive-dialog',
  templateUrl: './officials-psychoactive-dialog.component.html',
  styleUrls: ['./officials-psychoactive-dialog.component.scss']
})
export class OfficialsPsychoactiveDialogComponent implements OnInit {

    public TestForm: FormGroup;

    public testTypeList;

    configForm: FormGroup;
    public imageSrc:any = '';
    public selectionChange:string = 'negativo';
    private file:any;
    selectedOfficial: any = {};
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _htService: HumanTalentService,
        private _fcService: BobyConfirmationService,
        public matDialogRef: MatDialogRef<OfficialsPsychoactiveDialogComponent>,
        private _archivoS: ClaimFilesService
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
                    this.TestForm.patchValue(this._data.selectedOfficial);
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

    saveTestOfficial(){

        this.selectedOfficial.id = BobyMockApiUtils.guid();
        this.selectedOfficial.id_funcionario = this._data.id_funcionario;
        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de guardar el registro.`,
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
                    if (['testdate'].includes(key)) {
                        testOfficial[key] = moment(testOfficial[key]).format('DD/MM/YYYY');
                    }
                });


                this._htService.putTestOfficial(testOfficial, this.selectedOfficial, this.file, this.imageSrc).subscribe(
                    (resp) => {
                        if ( !resp.error) {
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

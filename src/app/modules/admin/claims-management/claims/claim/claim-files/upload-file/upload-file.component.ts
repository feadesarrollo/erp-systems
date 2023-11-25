import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { BobyConfirmationService } from '@boby/services/confirmation';
import { ClaimFilesService } from "../claim-files.service";
import { environment } from '../../../../../../../../environments/environment';

@Component({
  selector: 'erp-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

    public UploadForm: FormGroup;
    public viewer_file: string ='url';

    private configForm: FormGroup;
    private imageSrc:any = '';



    //public url: string = 'http://10.150.0.91/kerp/uploaded_files/sis_workflow/DocumentoWf/4e96e3947df25e392b2b7cbd3305ad1a.pdf';
    //public url: string = 'http://10.150.0.91/kerp/uploaded_files/sis_workflow/DocumentoWf/0cf9d6d6c15e26f97e3d6cc6cc3ce1f8.docx';
    public url: string = '';
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<UploadFileComponent>,
        private _fcService: BobyConfirmationService,
        private _archivoS: ClaimFilesService) { }

    ngOnInit(): void {

        this.viewer_file = this._data.viewer_file;

        if (this._data.archivo_generado) {
            //this.url = `http://10.150.0.91/kerp/reportes_generados/${this._data.archivo_generado}`;
            this.url = `${environment.filesUrl}reportes_generados/${this._data.archivo_generado}`;
        }else{
            //this.url = `http://10.150.0.91/kerp/${this._data.url.substring(11)}`;
            this.url = `${environment.filesUrl}${this._data.url.substring(11)}`;
        }

        this.UploadForm = this._formBuilder.group({
            archivo: ['',[Validators.required]],
            //dataArchivo: ['',[Validators.required]],
            id_proceso_wf: [this._data.id_proceso_wf,[Validators.required]]
        });



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
     * Upload archivo
     */
    onUploadArchivo(fileList: FileList): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const file = fileList[0];

        // Return if the file is not allowed
        if ( !allowedTypes.includes(file.type) )
        {

            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `<p class="font-bold">Estimado Usuario:<br> El formato ${file.type} no esta permitido.</p>`,
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
                this.UploadForm.get('archivo').reset();
            });
            return;
        }

        this.matDialogRef.close();

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.imageSrc = reader.result;
            this._archivoS.onUploadArchivo(this._data.id_proceso_wf,this._data.id_documento_wf, file, this.imageSrc).subscribe(
                (response)=>{

                }
            );
        };

    }

    /**
     * Upload archivo
     */
    /*onSaveArchivo(): void
    {
        // Upload the avatar
        this._archivoS.onSaveArchivo(/!*this.contact.id, file*!/).subscribe(
            ()=>{

            }
        );
    }*/

}

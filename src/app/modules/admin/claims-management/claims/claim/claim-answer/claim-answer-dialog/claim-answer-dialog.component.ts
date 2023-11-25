import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ClaimAnswerService } from "../claim-answer.service";

import { Subject, takeUntil, fromEvent } from 'rxjs';
import * as moment from "moment";
import { QuillEditorComponent } from 'ngx-quill'
import { BobyConfirmationService } from "@boby/services/confirmation";

@Component({
    selector: 'erp-claim-answer-dialog',
    templateUrl: './claim-answer-dialog.component.html',
    styleUrls: ['./claim-answer-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimAnswerDialogComponent implements OnInit {

    @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent;
    htmlText ="<p>Testing</p>";
    public quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['clean'],
            [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['blockquote', 'code-block'],
            [{ 'direction': 'rtl' }],

            ['link', 'image', 'video'],                         // link and image, video
            ['emoji'],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        ]
    };


    public modules = {
        'emoji-shortname': true,
        'emoji-textarea': true,
        'emoji-toolbar': true,
        'toolbar': [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction

            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['clean'],                                         // remove formatting button

            ['link', 'image', 'video'],                         // link and image, video
            ['emoji']

        ]
    };


    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public RespuestaForm: FormGroup;
    private showMessage : string;
    private configForm: FormGroup;
    public  listTemplate: any = [];
    @ViewChild('citeNumber') citeNumber: ElementRef;
    private selectedTemplate: any;
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _responseS: ClaimAnswerService,
        public matDialogRef: MatDialogRef<ClaimAnswerDialogComponent>,
        private _fcService: BobyConfirmationService
    ) { }

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



        if ( this._data.momento == 'nuevo' ){

            this._responseS.validateCiteNumber({num_cite:0}).subscribe(
                ( response: any ) => {
                    this.RespuestaForm.get('nro_cite').setValue(response.v_cite);
                }
            );

            this.RespuestaForm = this._formBuilder.group({
                id_reclamo: [this._data.claim.id_reclamo,[Validators.required]],
                fecha_respuesta: [new Date(),[Validators.required]],
                nro_cite: [{value: '', disabled: true}],
                asunto: ['',[Validators.required]],
                destinatario: [{value: this._data.claim.desc_nom_cliente, disabled: true},[Validators.required]],
                correos: [{value: this._data.claim.email, disabled: false},[Validators.required]],
                respuesta: [''/*,[Validators.required]*/],
                recomendaciones: ['',[Validators.required]],
                procedente: ['',[Validators.required]],
                tipo_respuesta: ['',[Validators.required]],
                id_template: ['']
            });
        }else if( this._data.momento == 'editar' ){

            this.RespuestaForm = this._formBuilder.group({
                id_reclamo: [this._data.respuesta.id_reclamo,[Validators.required]],
                id_respuesta: [this._data.respuesta.id_respuesta,[Validators.required]],
                fecha_respuesta: ['',[Validators.required]],
                //nro_cite: ['',[Validators.required]],
                nro_cite: [{value: '', disabled: true}],
                asunto: ['',[Validators.required]],
                destinatario: [{value: this._data.claim.desc_nom_cliente, disabled: true},[Validators.required]],
                correos: [{value: this._data.claim.email, disabled: false},[Validators.required]],
                respuesta: [''/*,[Validators.required]*/],
                recomendaciones: ['',[Validators.required]],
                procedente: ['',[Validators.required]],
                tipo_respuesta: ['',[Validators.required]],
                id_template: [this._data.respuesta.id_template]
            });
            this.RespuestaForm.patchValue(this._data.respuesta);
        }


    }

    ngAfterViewInit() {

        /*fromEvent(this.citeNumber.nativeElement, 'input')
            .pipe(map((event: Event) => (event.target as HTMLInputElement).value))
            .pipe(debounceTime(3000))
            .pipe(distinctUntilChanged())
            .subscribe(data => {
                    const params = {num_cite:data};
                    this._responseS.validateCiteNumber(params).subscribe(
                        ( response: any ) => {
                            this.RespuestaForm.get('nro_cite').setValue(response.v_cite);
                        }
                    );

            });*/

    }

    onEditorCreated(quill: any): any {
        this.editor = quill;
        //this.editor.insertText(editor.getLength() - 1, '', 'user')
    }

    /**
     * Save respuesta
     */
    createRespuesta()
    {
        this._responseS.validateCiteNumber({num_cite:0}).subscribe(
            ( response: any ) => {
                this.RespuestaForm.get('nro_cite').setValue(response.v_cite);
            }
        );

        const respuesta = this.RespuestaForm.getRawValue();
        Object.keys(respuesta).forEach(key => {

            if(key == 'fecha_respuesta'){
                respuesta[key] = moment.utc(respuesta.fecha_respuesta).format('DD/MM/YYYY');
            }
        });

        this._responseS.createRespuesta(respuesta)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.matDialogRef.close(response);
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
     * load template answer
     */
    filterByQueryTemplate(query: string): void
    {
        this._responseS.filterByQueryTemplate('respuesta',query, this._data.claim.id_tipo_incidente).subscribe(
            (resp: any) => {
                this.listTemplate = resp.datos;
            }
        );
    }

    /**
     * Get getTemplate Answer
     */
    getTemplateAnswer(id_template: string) {
        /*if (this.listTemplate?.length > 0) {
            //return this.listTemplate?.find(temp => temp.id_template === id_template).content;
            this.selectedTemplate = this.listTemplate.find(temp => temp.id_template === id_template);
            return JSON.parse(this.selectedTemplate.json_template).name;
        }else{
            return this._data.respuesta.desc_template;
        }*/
        if ( this._data.momento == 'nuevo' ) {
            if (id_template !== null && id_template !== undefined && id_template !== '') {
                this.selectedTemplate = this.listTemplate.find(temp => temp.id_template === id_template);
                return JSON.parse(this.selectedTemplate.json_template).name;
            }
        }else if( this._data.momento == 'editar' ){
            if( this.listTemplate.length > 0 ) {
                this.selectedTemplate = this.listTemplate.find(temp => temp.id_template === id_template);
                const templateName = JSON.parse(this.selectedTemplate.json_template).name
                if ( templateName !== this._data.respuesta.desc_template ) {
                    return templateName;
                } else {
                    return this._data.respuesta.desc_template;
                }
            }else {
                return this._data.respuesta.desc_template;
            }
        }
    }

    optionSelected(event) {
        this.RespuestaForm.get('respuesta').setValue(this.selectedTemplate.content);
    }

    selectionChange(option: string) {

    }

    parse(obj){
        return JSON.parse(obj);
    }

}

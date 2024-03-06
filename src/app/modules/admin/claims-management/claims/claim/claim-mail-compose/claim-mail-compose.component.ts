import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ClaimsService} from "../../claims.service";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'erp-claim-mail-compose',
  templateUrl: './claim-mail-compose.component.html'
})
export class ClaimMailComposeComponent implements OnInit {

    composeForm: FormGroup;
    copyFields: { cc: boolean; bcc: boolean } = {
        cc : false,
        bcc: false
    };
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
            ['clean']
        ]
    };

    public officialsListTo: any [] = [];
    public officialsListCC: any [] = [];
    public officialsListBCC: any [] = [];
    private imageSrc:any = '';
    private configForm: FormGroup;
    public claim: any;

    public selectedEmail: string[] = [];
    public selectedEmailCC: string[] = [];
    public selectedEmailBCC: string[] = [];
    @ViewChild('emailInputCC') emailInputCC: ElementRef<HTMLInputElement>;
    @ViewChild('emailInputBCC') emailInputBCC: ElementRef<HTMLInputElement>;
    public separatorKeysCodes: number[] = [ENTER, COMMA];
    public mode:string = 'SOLO_CORREO';
    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public matDialogRef: MatDialogRef<ClaimMailComposeComponent>,
        private _formBuilder: FormBuilder,
        private _claimService: ClaimsService,
        private _fcService: BobyConfirmationService,
        private _loadService: BobyLoadingService,
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.claim = this._data.claim;

        // Create the form
        this.composeForm = this._formBuilder.group({
            to     : ['', [Validators.required, Validators.email]],
            cc     : [''/*, [Validators.email]*/],
            bcc    : [''/*, [Validators.email]*/],
            subject: [''],
            body   : ['', [Validators.required]],
            mode   : ['SOLO_CORREO', [Validators.required]],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the copy field with the given field name
     *
     * @param name
     */
    showCopyField(name: string): void
    {
        // Return if the name is not one of the available names
        if ( name !== 'cc' && name !== 'bcc' )
        {
            return;
        }

        // Show the field
        this.copyFields[name] = true;
    }

    /**
     * Save and close
     */
    saveAndClose(): void
    {
        // Save the message as a draft
        this.saveAsDraft();

        // Close the dialog
        this.matDialogRef.close();
    }

    /**
     * Discard the message
     */
    discard(): void
    {
        this.close();
    }

    /**
     * Save the message as a draft
     */
    saveAsDraft(): void
    {

    }

    /**
     * Send the message
     */
    send(): void
    {
        this._claimService.sendMail(this.composeForm.getRawValue(), this._data.claim.id_reclamo).subscribe(
            (response: any) => {
                this.close();
            }
        );
    }

    /**
     * close
     */
    close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    /**
     * GET List Officials
     */
    searchOfficialsEmails(query: string, type: string): void
    {
        this._claimService.searchOfficialsEmails(query).subscribe(
            (officialList) => {


                switch (type) {
                    case 'to':
                        this.officialsListTo = officialList;
                        break;
                    case 'cc':
                        this.officialsListCC = officialList;
                        break;
                    case 'bcc':
                        this.officialsListBCC = officialList;
                        break;
                }

            }
        );
    }

    /**
     * GET Name Offical To
     */
    officialToListName(email_empresa: string) {
        if ( this.officialsListTo.length > 0 ) {
            return this.officialsListTo.find(official => official.email_empresa === email_empresa).email_empresa;
        }
    }

    /**
     * GET Name Offical CC
     */
    officialCCListName(email_empresa: string) {
        if ( this.officialsListCC.length > 0 ) {
            return this.officialsListCC.find(official => official.email_empresa === email_empresa).email_empresa;
        }
    }

    /**
     * GET Name Offical BCC
     */
    officialBCCListName(email_empresa: string) {
        if ( this.officialsListBCC.length > 0 ) {
            return this.officialsListBCC.find(official => official.email_empresa === email_empresa).email_empresa;
        }
    }

    /**
     * Upload file
     */
    onUploadFile(fileList: FileList): void
    {
        console.warn('this._data.claim',this._data.claim);
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','audio/mpeg','audio/midi','audio/x-midi','audio/x-wav','video/mp4','video/mpeg','video/webm','video/x-msvideo','image/png','image/jpeg','image/jpg','image/gif','image/webp'];
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

            });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        this._loadService.show();
        reader.onload = () => {
            this._loadService.hide();
            this.imageSrc = reader.result;
            this._claimService.onUploadFile(this.claim.id_reclamo, file, this.imageSrc).subscribe(
                (response)=>{
                    /*this.claim.json_attachment.forEach((value, index) =>{
                        if ( value.id_reclamo == this.claim.id_reclamo ) {

                            const json_attachment = JSON.parse(value.json_attachment);

                            json_attachment.push(JSON.parse(response.file));

                            value.json_attachment = JSON.stringify(json_attachment);

                        }
                    });*/
                    this.claim.json_attachment.push(JSON.parse(response.file));
                    this._changeDetectorRef.markForCheck();
                }
            );
        };
    }

    selectedMode(event): void {
        this.mode = event.value;
    }

    addCC(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        // Add our email
        if (value) {
            this.selectedEmailCC.push(value);
        }
        // Clear the input value
        event.chipInput!.clear();

        this.composeForm.get('cc').setValue(this.selectedEmailCC);
    }

    removeCC(fruit: string): void {
        const index = this.selectedEmailCC.indexOf(fruit);
        if (index >= 0) {
            this.selectedEmailCC.splice(index, 1);
        }
    }

    selectedCC(event: MatAutocompleteSelectedEvent): void {
        this.selectedEmailCC.push(event.option.value);
        this.emailInputCC.nativeElement.value = '';
        this.composeForm.get('cc').setValue(this.selectedEmailCC);
    }

    addBCC(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        // Add our email
        if (value) {
            this.selectedEmailBCC.push(value);
        }
        // Clear the input value
        event.chipInput!.clear();

        this.composeForm.get('bcc').setValue(this.selectedEmailBCC);
    }

    removeBCC(fruit: string): void {
        const index = this.selectedEmailBCC.indexOf(fruit);
        if (index >= 0) {
            this.selectedEmailBCC.splice(index, 1);
        }
    }

    selectedBCC(event: MatAutocompleteSelectedEvent): void {
        this.selectedEmailBCC.push(event.option.value);
        this.emailInputBCC.nativeElement.value = '';
        this.composeForm.get('bcc').setValue(this.selectedEmailBCC);
    }

}

import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AdministratorService} from "../../administrator.service";
import {BobyConfirmationService} from "@boby/services/confirmation";
import {BobyMockApiUtils} from "@boby/lib/mock-api";
import {GroupEmailsService} from "../group-emails.service";

@Component({
  selector: 'erp-group-emails-dialog',
  templateUrl: './group-emails-dialog.component.html',
  styleUrls: ['./group-emails-dialog.component.scss']
})
export class GroupEmailsDialogComponent implements OnInit {

    submitted: boolean = false;
    loading: boolean;
    public dataSource: MatTableDataSource<any>;

    public groupForm: FormGroup;
    configForm: FormGroup;
    showMessage : string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<GroupEmailsDialogComponent>,
        private _geService: GroupEmailsService,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {
        this.groupForm = this._formBuilder.group({
            id: [''],
            email: ['',[Validators.required]],
            code: [''],
            description: ['',[Validators.required]]
        });

        this.showMessage = this._data.status == 'new' ? 'crear' : 'modificar';
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

        if ( this._data.status == 'edit' ) {
            this.groupForm.patchValue(this._data.group.json_classifier);
        }
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    saveGroupEmails() {

        this.submitted = true;
        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {//cancelled, confirmed
            if (result == 'confirmed') {

                if ( this._data.status == 'edit' ) {
                    const group = this.groupForm.value;
                    Object.keys(this.groupForm.value).forEach(key => {
                        if (!group[key]) {
                            group[key] = '';
                        }
                    });

                    let codes = [];
                    this.groupForm.get('email').value.split(' ').forEach( (value) => {
                        codes.push(value[0]);
                    });
                    this.groupForm.get('code').setValue( codes.join('').toLowerCase() );

                    this._geService.postGroupEmails(this.groupForm.value,this._data.group.id_classifiers,this._data.status).subscribe(
                        (resp: any) => {
                            this.matDialogRef.close(resp);
                        }
                    );

                }else{

                    let codes = [];
                    this.groupForm.get('email').value.split(' ').forEach( (value) => {
                        codes.push(value[0]);
                    });
                    this.groupForm.get('id').setValue( BobyMockApiUtils.guid() );
                    this.groupForm.get('code').setValue( codes.join('').toLowerCase() );

                    this._geService.postGroupEmails(this.groupForm.value,0,this._data.status).subscribe(
                        (resp: any) => {

                            this.matDialogRef.close(resp);
                        }
                    );
                }
            }else{
                this.matDialogRef.close(this.groupForm.value);
            }
        });

    }

}

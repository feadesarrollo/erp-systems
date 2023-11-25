import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import { FormBuilder } from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../../../../../../environments/environment";

@Component({
  selector: 'erp-view-document-dialog',
  templateUrl: './view-document-dialog.component.html',
  styleUrls: ['./view-document-dialog.component.scss']
})
export class ViewDocumentDialogComponent implements OnInit {

    public viewer_file: string ='url';
    public url: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<ViewDocumentDialogComponent>
    ) { }

    ngOnInit(): void {
        this.viewer_file = this._data.viewer_file;
        this.url = `${environment.filesUrl}${this._data.document_path.substring(11)}`;
    }

}

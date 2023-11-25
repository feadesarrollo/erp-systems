import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../../../../../environments/environment";

@Component({
  selector: 'erp-view-doc-gen-dialog',
  templateUrl: './view-doc-gen-dialog.component.html',
  styleUrls: ['./view-doc-gen-dialog.component.scss']
})
export class ViewDocGenDialogComponent implements OnInit {

    public viewer_file: string ='url';
    public url: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<ViewDocGenDialogComponent>
    ) { }

    ngOnInit(): void {
        this.viewer_file = this._data.viewer_file;
        this.url = `${environment.filesUrl}reportes_generados/${this._data.archivo_generado}`;
    }

}

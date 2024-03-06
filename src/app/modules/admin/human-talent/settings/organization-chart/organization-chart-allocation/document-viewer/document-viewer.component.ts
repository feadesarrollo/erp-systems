import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../../../../../../environments/environment";

@Component({
  selector: 'erp-document-viewer',
  templateUrl: './document-viewer.component.html'
})
export class DocumentViewerComponent implements OnInit {

    public viewer_file: string ='url';
    public url: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<DocumentViewerComponent>
    ) { }

    ngOnInit(): void {
        console.warn('this._data',this._data);
        this.viewer_file = this._data.viewer_file;
        this.url = `${environment.filesUrl}reportes_generados/${this._data.archivo_generado}`;
    }

}

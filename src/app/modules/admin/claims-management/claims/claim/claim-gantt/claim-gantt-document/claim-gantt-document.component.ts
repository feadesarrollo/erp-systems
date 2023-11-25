import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../../../../../../environments/environment";

@Component({
    selector: 'erp-claim-gantt-document',
    templateUrl: './claim-gantt-document.component.html',
    styleUrls: ['./claim-gantt-document.component.scss']
})
export class ClaimGanttDocumentComponent implements OnInit {

    public viewer_file: string ='url';
    public url: string = '';

    constructor(@Inject(MAT_DIALOG_DATA) public _data: any,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                public matDialogRef: MatDialogRef<ClaimGanttDocumentComponent>
    ) { }

    ngOnInit(): void {
        this.viewer_file = this._data.viewer_file;
        this.url = `${environment.filesUrl}${this._data.file_name.substring(11)}`;
    }

}

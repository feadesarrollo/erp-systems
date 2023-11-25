import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {AdministratorService} from "../../administrator.service";
import { Subject } from 'rxjs';

@Component({
    selector: 'erp-file-manager-view',
    templateUrl: './file-manager-view.component.html',
    styleUrls: ['./file-manager-view.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerViewComponent implements OnInit {

    public searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public content: string = '';
    public title: string = '';
    private template: string = '';
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public matDialogRef: MatDialogRef<FileManagerViewComponent>,
        private _adminService: AdministratorService
    ) { }

    ngOnInit(): void {
        this.title = this._data.item.json_template.name;
        this.content = this._data.item.content ?? '';
        this.template = this.content;
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(debounceTime(2000))
            .subscribe(contents => {
                this.template = contents;
                this._adminService.postContentsTemplate(contents, this._data.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {

                    });
            });

    }

    /**
     * close
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close(this.template);
    }

}

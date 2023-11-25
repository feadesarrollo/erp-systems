import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LandingDataService} from "../landing-data.service";
import { takeUntil, Observable, Subject } from 'rxjs';
import {MatTableDataSource} from "@angular/material/table";
import {debounceTime, map, switchMap} from "rxjs/operators";
import {ClaimGanttDocumentComponent} from "../../../claims-management/claims/claim/claim-gantt/claim-gantt-document/claim-gantt-document.component";
import {BobyLoadingService} from "../../../../../../@boby/services/loading";
import {BobyConfirmationService} from "../../../../../../@boby/services/confirmation";

@Component({
    selector: 'erp-closing-dialog',
    templateUrl: './closing-dialog.component.html',
    styleUrls: ['./closing-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosingDialogComponent implements OnInit {
    private configForm: FormGroup;
    private imageSrc:any = '';
    public viewer_file: string ='url';

    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public pagination: any = {};
    public items: any[] = [];

    public djson: any = {};
    public pageSizeOptions = [5, 10, 25, 50, 100];
    dataSource: MatTableDataSource<any>;
    public selectedItem;

    displayedColumns = [/*'accion',*/'tipoTrafico','importeAterrizaje','importeRecargoNocturno','importeRecargoDomingo','importeFeriado','importeTotalAterrizaje'];

    cols = [
        { field: 'tipoTrafico', header: 'Tipo Trafico', width: 'min-w-32'},
        { field: 'importeAterrizaje', header: 'Importe Aterrizaje', width: 'min-w-32'},
        { field: 'importeRecargoNocturno', header: 'Importe Recargo Nocturno', width: 'min-w-52'},
        { field: 'importeRecargoDomingo', header: 'Importe Recargo Domingo', width: 'min-w-52'},
        { field: 'importeFeriado', header: 'Importe Feriado', width: 'min-w-32'},
        { field: 'importeTotalAterrizaje', header: 'Importe Total Aterrizaje', width: 'min-w-52'}
    ];
    public files: any[] = [];
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public matDialogRef: MatDialogRef<ClosingDialogComponent>,
        private _landingService: LandingDataService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _loadService: BobyLoadingService,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {

        this._landingService.getConciliationClosing(this._data.list,this._data.startDate,this._data.endDate,this._data.ato,this._data.aircraft).subscribe(
            (resp) => {
                this.djson = resp.djson;
                // Get the items
                this._landingService.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {
                        // Update the pagination
                        this.pagination = pagination;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get the items
                this._landingService.items$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((items: any[]) => {
                        //this.items = items;
                        this.dataSource = new MatTableDataSource(items);
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
        });


        // Subscribe to search input field value changes
        /*this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    return this._htService.searchTestQuery(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.queryList);
                    this.pagination = search.pagination;


                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();*/
    }

    /**
     * Close dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    refreshItems(){

    }

    /**
     * Upload file
     */
    onUploadFile(fileList: FileList, item: any): void
    {
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
            this._landingService.onUploadFile(this.djson.id_landing, item.idLandingClosing, file, this.imageSrc).subscribe(
                (response)=>{
                    this._landingService.closing$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((closing: any) => {
                            // Update the pagination
                            this.files = closing.landing_closing.find(file => file.idLandingClosing === this.selectedItem.idLandingClosing).files;
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            );
        };
    }

    selected(row){
        this.selectedItem = row;
        this.files = this.selectedItem.files;
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * file action
     */
    fileAction(action: string, file:any): void
    {
        /*if (file?.file_name) {
            this.viewer_file = 'url';
            file.viewer_file = this.viewer_file;
            const dialogRef = this._matDialog.open(ClaimGanttDocumentComponent, {
                data: file
            });

            dialogRef.afterClosed()
                .subscribe((result) => {

                });
        }*/
    }

}

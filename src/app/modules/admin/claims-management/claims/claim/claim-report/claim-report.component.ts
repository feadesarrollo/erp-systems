import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BobyConfirmationService } from '@boby/services/confirmation';

import { takeUntil, Subject, merge, switchMap, map, Observable, debounceTime } from 'rxjs';

import { ClaimReportService } from "./claim-report.service";
import { ClaimReportDialogComponent } from "../claim-report/claim-report-dialog/claim-report-dialog.component";
import {Select} from "@ngxs/store";
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";

@Component({
    selector: 'erp-claim-report',
    templateUrl: './claim-report.component.html',
    styleUrls: ['./claim-report.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimReportComponent implements OnInit {

    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getPermissions) permission$: Observable<any>;
    /******************************** STORE ********************************/
    @Input() reclamo: any;

    configForm: FormGroup;
    selectedReport : any = {};
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    pagination: any = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    informes$: Observable<any[]>;
    momento: string = '';
    searchInputControl: FormControl = new FormControl();


    displayedColumns = [
        'icono', 'accion', 'nro_informe', 'desc_fun', 'lista'
    ];
    cols = [
        { field: 'nro_informe', header: 'Numero Inf.', width: 'min-w-32' },
        { field: 'desc_fun', header: 'Funcionario', width: 'min-w-72' },
        { field: 'lista', header: 'Compensaciones', width: 'min-w-96' }
    ];

    public rolesAllowed: any = [];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _informeS: ClaimReportService,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {
        this.permission$.subscribe(permits => {
            if ( permits.permitsReport?.length > 0 ){
                this.rolesAllowed = permits.permitsReport.find(perm => perm.states.includes(this.reclamo.estado))?.permission || [];
            }
        });

        this._informeS.getInformes(0,5,'nombre_tipo_documento','asc', '', this.reclamo).subscribe(
            (resp) => {
                this.informes$ = this._informeS.informes$;
            });

        // Get the pagination
        this._informeS.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                // Update the pagination
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._informeS.getInformes(0, 10, 'name', 'asc', query, this.reclamo);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            this._sort.sort({
                id          : 'name',
                start       : 'asc',
                disableClear: true
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                    // Close the details
                    //this.closeDetails();
                });

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    //this.closeDetails();
                    this.isLoading = true;

                    return this._informeS.getInformes(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, '', this.reclamo);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
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
     * Create a new Informe
     */
    createInforme(){

        this.momento = 'nuevo';
        const dialogRef = this._matDialog.open(ClaimReportDialogComponent,{
            height: '80%',
            width: '60%',
            data: {
                momento: this.momento,
                reclamo: this.reclamo
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this._informeS.getInformes(0,5,'nombre_tipo_documento','asc', '', this.reclamo).subscribe(
                    (resp) => {
                        this.informes$ = this._informeS.informes$;
                    });
                // Get the pagination
                this._informeS.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {
                        // Update the pagination
                        this.pagination = pagination;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            });
    }

    /**
     * Create a new Reclamo
     */
    editInforme(informe: object){

        this.momento = 'editar';
        const dialogRef = this._matDialog.open(ClaimReportDialogComponent,{
            data: {informe, momento: this.momento},
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this._informeS.getInformes(0,5,'nombre_tipo_documento','asc', '', this.reclamo).subscribe(
                    (resp) => {
                        this.informes$ = this._informeS.informes$;
                    });
                // Get the pagination
                this._informeS.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {
                        // Update the pagination
                        this.pagination = pagination;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            });

    }

    /**
     * Create a new Reclamo
     */
    deleteInforme(informe: object): void{

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `Estimado Usuario, esta seguro de eliminar el registro?`,
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                this._informeS.deleteInforme(informe).subscribe(
                    (response) => {
                        this._informeS.getInformes(0,5,'nombre_tipo_documento','asc', this.reclamo).subscribe(
                            (resp) => {
                                this.informes$ = this._informeS.informes$;
                            });

                        // Get the pagination
                        this._informeS.pagination$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((pagination: any) => {
                                // Update the pagination
                                this.pagination = pagination;
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                );
            }else{

            }
        });
    }

}

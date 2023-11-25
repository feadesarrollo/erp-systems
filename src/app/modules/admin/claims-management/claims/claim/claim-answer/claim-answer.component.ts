import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import { ClaimAnswerService } from "./claim-answer.service";
import { BobyConfirmationService} from "@boby/services/confirmation";
import { ClaimAnswerDialogComponent } from "./claim-answer-dialog/claim-answer-dialog.component";

import {Observable, Subject, merge, map} from "rxjs";
import {debounceTime,  switchMap, takeUntil} from "rxjs/operators";
import {Select} from "@ngxs/store";
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";

@Component({
    selector: 'erp-claim-answer',
    templateUrl: './claim-answer.component.html',
    styleUrls: ['./claim-answer.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimAnswerComponent implements OnInit {
    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getPermissions) permission$: Observable<any>;
    /******************************** STORE ********************************/
    @Input() reclamo: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    configForm: FormGroup;
    isLoading: boolean = false;
    pagination: any = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    respuestas$: Observable<any[]>;

    searchInputControl: FormControl = new FormControl();

    selectedAnswer : any = {};
    displayedColumns = [
        'icono', 'accion', 'nro_respuesta', 'estado', 'nro_cite', 'procedente'
    ];
    cols = [
        { field: 'nro_respuesta', header: 'Num. Respuesta', width: 'min-w-96' },
        { field: 'estado', header: 'Estado', width: 'min-w-44' },
        { field: 'nro_cite', header: 'Nro. Cite', width: 'min-w-32' },
        { field: 'procedente', header: 'Procedente', width: 'min-w-32' }

    ];
    public momento: string = '';
    public rolesAllowed: any = [];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _respuestaS: ClaimAnswerService,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {

        this.permission$.subscribe(permits => {
            if ( permits.permitsClaim?.length > 0 ){
                this.rolesAllowed = permits.permitsClaim.find(perm => perm.states.includes(this.reclamo.estado))?.permission || [];
            }
        });

        if ( this.rolesAllowed?.length ) {
            this._respuestaS.getRespuestas(0, 5, 'nro_respuesta', 'asc', '', this.reclamo, 'RespuestaDetalle').subscribe(
                (resp) => {
                    this.respuestas$ = this._respuestaS.respuestas$;
                });

            // Get the pagination
            this._respuestaS.pagination$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagination: any) => {
                    // Update the pagination
                    this.pagination = pagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._respuestaS.getRespuestas(0, 10, 'nro_respuesta', 'asc', query, this.reclamo, 'RespuestaDetalle');
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
                    this.isLoading = true;
                    return this._respuestaS.getRespuestas(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, '', this.reclamo, 'RespuestaDetalle');
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
     * Create respuesta
     */
    createRespuesta(){

        this.momento = 'nuevo';

        const dialogRef = this._matDialog.open(ClaimAnswerDialogComponent,{
            data: {

                id_reclamo :this.reclamo.id_reclamo,
                desc_nom_cliente :this.reclamo.desc_nom_cliente,
                email :this.reclamo.email,
                claim :this.reclamo,
                momento: this.momento
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

                if (result.error) {
                    // Build the config form
                    this.configForm = this._formBuilder.group({
                        title: 'Alerta',
                        message: `<p class="font-bold">${result.message}</p>`,
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

                }else{

                    this._respuestaS.getRespuestas(0, 5, 'nro_respuesta', 'asc', '', this.reclamo, 'RespuestaDetalle').subscribe(
                        (resp) => {
                            this.respuestas$ = this._respuestaS.respuestas$;
                        });
                    // Get the pagination
                    this._respuestaS.pagination$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((pagination: any) => {
                            // Update the pagination
                            this.pagination = pagination;
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });
    }

    /**
     * Create a new Reclamo
     */
    editRespuesta(respuesta: object){
        this.momento = 'editar';
        const dialogRef = this._matDialog.open(ClaimAnswerDialogComponent,{
            data: {
                respuesta,
                momento : this.momento,
                desc_nom_cliente : this.reclamo.desc_nom_cliente,
                email :this.reclamo.email,
                claim : this.reclamo
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this._respuestaS.getRespuestas(0,5,'nro_respuesta','asc', '', this.reclamo, 'RespuestaDetalle').subscribe(
                    (resp) => {
                        this.respuestas$ = this._respuestaS.respuestas$;
                    });
                // Get the pagination
                this._respuestaS.pagination$
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
    deleteRespuesta(respuesta: object): void{

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
                this._respuestaS.deleteRespuesta(respuesta).subscribe(
                    (response) => {
                        if ( !response.error ) {
                            this._respuestaS.getRespuestas(0, 5, 'nro_respuesta', 'asc', '', this.reclamo, 'RespuestaDetalle').subscribe(
                                (resp) => {
                                    this.respuestas$ = this._respuestaS.respuestas$;
                                });

                            // Get the pagination
                            this._respuestaS.pagination$
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((pagination: any) => {
                                    // Update the pagination
                                    this.pagination = pagination;
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }else{

                        }
                    }
                );
            }else{

            }
        });
    }


}

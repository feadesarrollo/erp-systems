import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {HumanTalentService} from "../../../human-talent.service";
import {MatDialog} from "@angular/material/dialog";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {ActivatedRoute, Router} from "@angular/router";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {ClaimsService} from "../../../../claims-management/claims/claims.service";
import {WizardDialogComponent} from "../../../../claims-management/claims/claim/wizard-dialog/wizard-dialog.component";
import {AlcoholControlDialogComponent} from "../alcohol-control-dialog/alcohol-control-dialog.component";
import {AlcoholControlGanttComponent} from "../alcohol-control-gantt/alcohol-control-gantt.component";
import {ViewDocGenDialogComponent} from "../view-doc-gen-dialog/view-doc-gen-dialog.component";
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import {ViewDocumentDialogComponent} from "../details-officials/view-document-dialog/view-document-dialog.component";
import {DetailsOfficialsDialogComponent} from "../details-officials/details-officials-dialog/details-officials-dialog.component";

@Component({
    selector: 'erp-test-query',
    templateUrl: './test-query.component.html',
    styleUrls: ['./test-query.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestQueryComponent implements OnInit {

    selectedOfficial: any = {};
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    public cols = [
        { field: 'testdate', header: 'Fecha Prueba', width: 'min-w-32'},
        { field: 'testtype', header: 'Tipo Prueba', width: 'min-w-32'},
        { field: 'result', header: 'Resultado', width: 'min-w-32'},
        { field: 'testconfirm', header: 'Prueba Confirmatoria', width: 'min-w-44'},

        { field: 'unit', header: 'Nombre Unidad', width: 'min-w-96'},
        { field: 'official', header: 'Funcionario', width: 'min-w-96'},
        { field: 'date', header: 'Fecha Plan', width: 'min-w-32'},
        { field: 'ci', header: 'CI', width: 'min-w-24'},
        { field: 'occupation', header: 'Cargo', width: 'min-w-96'},
        { field: 'office', header: 'Oficina', width: 'min-w-96'},
        { field: 'place', header: 'Lugar', width: 'min-w-32'},

        { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];
    public displayedColumns = [ 'accion','picture','official','status','ci','date','testdate','testtype','result','testconfirm','unit','occupation','office','place'];

    public selectedUnits: any[] = [];
    private configForm: FormGroup;
    public viewer_file: string ='url';
    /******************************* FILTERS *******************************/
    FilterForm: FormGroup;
    yearList: any [] = [];
    monthList: any [] = [];
    dayList: any [] = [];
    /******************************* FILTERS *******************************/
    constructor(
        private messageService: MessageService,
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _loadService: BobyLoadingService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _messageService: MessageService,
        private _fcService: BobyConfirmationService,
        private _claimService: ClaimsService
    ) { }

    ngOnInit(): void {

        this.FilterForm = this._formBuilder.group({
            year: ['',[Validators.required]],
            month: ['',[Validators.required]],
            day: ['all',[Validators.required]],
            type: ['',[Validators.required]]
        });

        this._selectedColumns = this.cols;

        this._htService.getYear().subscribe(
            (years: any[]) => {
                this.yearList = years;
                const year = this.yearList.find(ges => ges.gestion == new Date().getFullYear());
                this.FilterForm.get('year').setValue(year.id_gestion);
                this._htService.getMonth(year.id_gestion).subscribe(
                    (months: any[]) => {
                        this.monthList = months;
                        const month = this.monthList.find(mon => mon.periodo == new Date().getMonth()+1);
                        this.FilterForm.get('month').setValue(month.id_periodo);
                        this._htService.getDay(month.id_periodo).subscribe(
                            (days: any[]) => {
                                this.dayList = days;
                                /*const month = this.monthList.find(mon => mon.periodo == new Date().getMonth()+1);
                                this.FilterForm.get('month').setValue(month.id_periodo);*/
                            }
                        );
                    }
                );
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._htService.searchTestQuery(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.queryList);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    onYearChange(ev) {

        this.FilterForm.get('month').reset();

        if (ev.value != 'blank') {

            let year = this.yearList.find(ges => ges.id_gestion == ev.value);

            this._htService.getMonth(ev.value).subscribe(
                (months: any[]) => {
                    this.monthList = months;
                }
            );

        }
    }

    onMonthChange(ev) {

        if ( this.FilterForm.invalid ){
            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `<p class="font-bold">Estimado Usuario, debe seleccionar todos los filtros.</p>`,
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
                if (result == 'confirmed') {
                    this._htService.getDay(this.FilterForm.get('month').value).subscribe(
                        (days: any[]) => {
                            this.dayList = days;
                        }
                    );
                }
            });
        }else{

            this._htService.getDay(this.FilterForm.get('month').value).subscribe(
                (days: any[]) => {
                    this.dayList = days;
                    /*********************** FILTER ***********************/
                    this._loadService.show();
                    this._htService.getTestQuery( this.FilterForm.getRawValue() ).subscribe(
                        (resp: any) => {
                            this._loadService.hide();
                            if ( resp.error ){
                                this.dataSource = new MatTableDataSource([]);
                                this.pagination = { length:0, size:0, page:0, lastPage:0, startIndex:0, endIndex :0};
                                this._messageService.add({
                                    severity: 'error',
                                    summary: 'ADVERTENCIA',
                                    detail: resp.message,
                                    life: 9000
                                });
                            }else {
                                this.dataSource = new MatTableDataSource(resp.queryList);
                                this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
                                this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                                    if (length === 0 || pageSize === 0) {
                                        return `0 de ${length}`;
                                    }
                                    length = Math.max(length, 0);
                                    const startIndex = page * pageSize;
                                    // If the start index exceeds the list length, do not try and fix the end index to the end.
                                    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                                    return `${startIndex + 1} - ${endIndex} de ${length}`;
                                };
                                this.paginator._intl.nextPageLabel = 'Página Siguiente';
                                this.paginator._intl.firstPageLabel = 'Primera Página';
                                this.paginator._intl.lastPageLabel = 'Ultima Página';
                                this.paginator._intl.previousPageLabel = 'Página Anterior';
                                this.pagination = resp.pagination;
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;

                                this.paginator.page.subscribe(
                                    (event) => {

                                    }
                                );
                            }
                        }
                    );
                    /*********************** FILTER ***********************/
                }
            );
        }
    }

    onDayChange(ev) {

        if ( this.FilterForm.invalid ){
            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `<p class="font-bold">Estimado Usuario, debe seleccionar todos los filtros.</p>`,
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
                if (result == 'confirmed') {

                }
            });
        }else{
            this._loadService.show();
            this._htService.getTestQuery( this.FilterForm.getRawValue() ).subscribe(
                (resp: any) => {
                    this._loadService.hide();
                    if ( resp.error ){
                        this._messageService.add({
                            severity: 'error',
                            summary: 'ADVERTENCIA',
                            detail: resp.message,
                            life: 9000
                        });
                    }else {
                        this.dataSource = new MatTableDataSource(resp.queryList);
                        this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
                        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                            if (length === 0 || pageSize === 0) {
                                return `0 de ${length}`;
                            }
                            length = Math.max(length, 0);
                            const startIndex = page * pageSize;
                            // If the start index exceeds the list length, do not try and fix the end index to the end.
                            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                            return `${startIndex + 1} - ${endIndex} de ${length}`;
                        };
                        this.paginator._intl.nextPageLabel = 'Página Siguiente';
                        this.paginator._intl.firstPageLabel = 'Primera Página';
                        this.paginator._intl.lastPageLabel = 'Ultima Página';
                        this.paginator._intl.previousPageLabel = 'Página Anterior';
                        this.pagination = resp.pagination;
                        this.dataSource.paginator = this.paginator;
                        this.dataSource.sort = this.sort;

                        this.paginator.page.subscribe(
                            (event) => {

                            }
                        );
                    }
                }
            );
        }
    }

    onTypeChange(ev) {
        if (ev.value != 'blank') {
            if ( this.FilterForm.get('year').value == '' || this.FilterForm.get('month').value == '' ) {
                // Build the config form
                this.configForm = this._formBuilder.group({
                    title: 'Alerta',
                    message: `<p class="font-bold">Estimado Usuario, debe seleccionar gestión y periodo.</p>`,
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
                    if (result == 'confirmed') {

                    }
                });
            }else{
                this._loadService.show();
                this._htService.getTestQuery( this.FilterForm.getRawValue() ).subscribe(
                    (resp: any) => {
                        this._loadService.hide();
                        if ( resp.error ){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        }else {
                            this.dataSource = new MatTableDataSource(resp.queryList);
                            this.paginator._intl.itemsPerPageLabel = "Registros por pagina";
                            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                                if (length === 0 || pageSize === 0) {
                                    return `0 de ${length}`;
                                }
                                length = Math.max(length, 0);
                                const startIndex = page * pageSize;
                                // If the start index exceeds the list length, do not try and fix the end index to the end.
                                const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                                return `${startIndex + 1} - ${endIndex} de ${length}`;
                            };
                            this.paginator._intl.nextPageLabel = 'Página Siguiente';
                            this.paginator._intl.firstPageLabel = 'Primera Página';
                            this.paginator._intl.lastPageLabel = 'Ultima Página';
                            this.paginator._intl.previousPageLabel = 'Página Anterior';
                            this.pagination = resp.pagination;
                            this.dataSource.paginator = this.paginator;
                            this.dataSource.sort = this.sort;

                            this.paginator.page.subscribe(
                                (event) => {

                                }
                            );
                        }
                    }
                );
            }
        }
    }


    testQuery(): void{

    }


    executeCommand(option) {
        switch (option) {
            case 'test_detail':
                this.openTestOfficialDialog();
                break;
            case 'export':

        }
    }

    openTestOfficialDialog(): void{

        const dialogRef = this._matDialog.open(DetailsOfficialsDialogComponent,{
            height: '60%',
            width: '80%',
            data: {
                status: 'edit',
                selectedUnits: this.selectedUnits,
                selectedOfficial : this.selectedOfficial
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: result.message,
                        life: 9000
                    });
                }else{
                    this._messageService.add({
                        severity: 'success',
                        summary: 'EXITO',
                        detail: `${result.detail.message}.`,
                        life: 9000
                    });
                    this.refreshDetailsOfficials();
                }
            });
    }

    refreshDetailsOfficials(){
        this._htService.getTestQuery( this.FilterForm.getRawValue() ).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.queryList);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );
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

    @Input() get selectedColumns(): any[] {
        this._changeDetectorRef.markForCheck();
        return this._selectedColumns;
    }

    set selectedColumns(val: any[]) {
        //restore original order
        this._selectedColumns = this.cols.filter(col => val.includes(col));
        this._changeDetectorRef.markForCheck();
    }

    /**************************************************** ***************************************************************/
    /**
     * Action archivo
     */
    viewDocument(document:any): void {
        if (document?.document_path) {
            this.viewer_file = 'url';
            document.viewer_file = this.viewer_file;
            const dialogRef = this._matDialog.open(ViewDocumentDialogComponent, {
                data: document
            });

            dialogRef.afterClosed()
                .subscribe((result) => {

                });
        }else{

        }


    }

}

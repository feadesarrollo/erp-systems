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
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {HumanTalentService} from "../../../human-talent.service";
import {MatDialog} from "@angular/material/dialog";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {ActivatedRoute, Router} from "@angular/router";
import {AlcoholControlDialogComponent} from "../alcohol-control-dialog/alcohol-control-dialog.component";
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import { TestTypeDialogComponent } from "./test-type-dialog/test-type-dialog.component";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";




@Component({
    selector: 'erp-test-type',
    templateUrl: './test-type.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class TestTypeComponent implements OnInit {

    selectedTestType: any = {};
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = [ 'accion', 'nombre','tipo','procedimiento'];

    cols = [
        { field: 'nombre', header: 'Nombre', width: 'min-w-32'},
        { field: 'tipo', header: 'Tipo', width: 'min-w-20'},
        { field: 'procedimiento', header: 'Procedimiento', width: 'min-w-96'},

        { field: 'estado_reg', header: 'Estado', width: 'min-w-20'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];

    selectedUnits: any[] = [];
    private configForm: FormGroup;
    constructor(
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _loadService: BobyLoadingService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _messageService: MessageService,
        private _route: ActivatedRoute,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit(): void {

        this._selectedColumns = this.cols;

        this._loadService.show();
        this._htService.getTestType().subscribe(
            (resp: any) => {
                if (resp.error){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: resp.message,
                        life: 9000
                    });
                }else {
                    this._loadService.hide();
                    this.dataSource = new MatTableDataSource(resp.testTypeList);
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

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._htService.searchTestType(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.testTypeList);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    openDialogLottery(): void{

        const dialogRef = this._matDialog.open(AlcoholControlDialogComponent,{
            height: '60%',
            width: '80%',
            data: {
                selectedUnits: this.selectedUnits
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
                        detail: `${result.detail.message}, Sorteo Generado.`,
                        life: 9000
                    });
                    this.refreshTestType();
                }
            });
    }

    executeCommand(option: string){
        switch (option) {
            case 'edit':
                this.showEditTestTypeDialog(this.selectedTestType);
                break;
            case 'delete':
                this.deleteTestType(this.selectedTestType);
                break;
        }
    }

    showNewTestTypeDialog(){
        const dialogRef = this._matDialog.open(TestTypeDialogComponent,{
            height: '70%',
            width: '50%',
            data: {status:'new'}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    this._messageService.add({
                        severity: 'success',
                        summary: 'EXITO',
                        detail: `Tipo Prueba ${result.nombre}  Guardado`,
                        life: 6000
                    });
                    this.refreshTestType();
                }
            });
    }

    showEditTestTypeDialog(testType: any) {

        const dialogRef = this._matDialog.open(TestTypeDialogComponent,{
            height: '70%',
            width: '50%',
            data: {testType, status: 'edit'}
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this._messageService.add({ severity: 'success', summary: 'EXITO', detail: `Tipo Prueba Modificado`, life: 9000 });
                this.refreshTestType();
            });
    }

    deleteTestType(testType: any) {

        // Build the config form
        this.configForm = this._formBuilder.group({
            title      : 'Confirmación',
            message    : `Estimado Usuario: Esta seguro de eliminar el registro.`,
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

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if ( result == 'confirmed' ){
                this._htService.deleteTestType(testType.id_tipo_prueba).subscribe(
                    (resp) => {
                        if (resp.error){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        }else {
                            this._messageService.add({
                                severity: 'success',
                                summary: 'EXITO',
                                detail: `Tipo Prueba ${testType.nombre} Eliminado`,
                                life: 9000
                            });
                            this.refreshTestType();
                        }
                    }
                );
            }
        });
    }

    refreshTestType(){
        this._htService.getTestType().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.testTypeList);
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

}

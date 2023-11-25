import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MessageService} from "primeng/api";
import {HumanTalentService} from "../../../human-talent.service";
import {MatDialog} from "@angular/material/dialog";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {ActivatedRoute, Router} from "@angular/router";
import {AlcoholControlDialogComponent} from "../../alcohol-control/alcohol-control-dialog/alcohol-control-dialog.component";
import {ViewDocumentDialogComponent} from "../../alcohol-control/details-officials/view-document-dialog/view-document-dialog.component";
import {DetailsOfficialsDialogComponent} from "../../alcohol-control/details-officials/details-officials-dialog/details-officials-dialog.component";
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import {OfficialsPsychoactiveDialogComponent} from "./officials-psychoactive-dialog/officials-psychoactive-dialog.component";
@Component({
  selector: 'erp-officials-psychoactive',
  templateUrl: './officials-psychoactive.component.html'
})
export class OfficialsPsychoactiveComponent implements OnInit {

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
        { field: 'testtype', header: 'Tipo Prueba', width: 'min-w-60'},
        { field: 'result', header: 'Resultado', width: 'min-w-44'},
        { field: 'testconfirm', header: 'Prueba Confirmatoria', width: 'min-w-44'},

        { field: 'unit', header: 'Nombre Unidad', width: 'min-w-96'},
        { field: 'official', header: 'Funcionario', width: 'min-w-96'},
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
    public displayedColumns = [ 'accion','picture','official','status','ci','testdate','testtype','result','testconfirm','unit','occupation','office','place'];
    public selectedUnits: any[] = [];
    public testTypeList;
    public viewer_file: string ='url';

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
        private _route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this._selectedColumns = this.cols;

        this._loadService.show();
        this._htService.getTestOfficial(this._route.snapshot.paramMap.get('id')).subscribe(
            (resp) => {
                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.officialList);
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
        );


        this._htService.getTestType().subscribe(
            (resp: any) => {
                this.testTypeList = resp.testTypeList;
            }
        );

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._htService.searchOffice(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.offices);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    showNewTestDialog(){
        const dialogRef = this._matDialog.open(OfficialsPsychoactiveDialogComponent,{
            height: '50%',
            width: '50%',
            data: {
                status: 'new',
                selectedOfficial:{},
                id_funcionario: this._route.snapshot.paramMap.get('id')
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
                        detail: `${result.detail.message}, prueba guardada.`,
                        life: 9000
                    });
                    this.refreshDetailsOfficials();
                }
            });
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
                    this.refreshDetailsOfficials();
                }
            });
    }

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

    executeCommand(option) {
        switch (option) {
            case 'test_detail':
                this.openTestOfficialDialog();
                break;
            case 'export':

        }
    }

    refreshDetailsOfficials(){

        this._htService.getTestOfficial(this._route.snapshot.paramMap.get('id')).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.officialList);
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

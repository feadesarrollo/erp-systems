import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Office} from "../../../../claims-management/settings/settings.type";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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
import {DetailsOfficialsDialogComponent} from "./details-officials-dialog/details-officials-dialog.component";
import { ViewDocumentDialogComponent } from "../details-officials/view-document-dialog/view-document-dialog.component";
import {PermissionsService} from "../../../permissions/permissions.service";

@Component({
  selector: 'erp-details-officials',
  templateUrl: './details-officials.component.html'
})
export class DetailsOfficialsComponent implements OnInit {

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

    public information: any;
    private id_control_sorteo_prueba: number;
    public allowed: any;
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
        private _route: ActivatedRoute,
        private _roles: PermissionsService
    ) { }

    ngOnInit(): void {
        this._selectedColumns = this.cols;
        this.id_control_sorteo_prueba = +this._route.snapshot.url[this._route.snapshot.url.length-3].path;
        this._loadService.show();
        this._htService.getDetailsOfficials(this._route.snapshot.paramMap.get('id'),this.id_control_sorteo_prueba).subscribe(
            (resp) => {
                this._loadService.hide();
                this.information = resp.information;
                this.dataSource = new MatTableDataSource(resp.officialsList);
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
                    return this._htService.searchDetailsOfficials(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.officialsList);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();

        this._roles.getRolesByOfficial()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles)=>{
                this.allowed = roles.find(sys => sys.permissionModule.find(mod=> mod.modules.includes('programa-psicoactivo'))).permissionModule.find(allow => allow.permission).permission;
                this._changeDetectorRef.markForCheck();
            });
    }

    showNewTestDialog(){

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
        if (document?.tests?.document_path) {
            this.viewer_file = 'url';
            document.tests.viewer_file = this.viewer_file;
            const dialogRef = this._matDialog.open(ViewDocumentDialogComponent, {
                data: document.tests
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
                status : 'edit',
                selectedUnits : this.selectedUnits,
                selectedOfficial : this.selectedOfficial,
                information : this.information,
                id_control_sorteo_prueba : this.id_control_sorteo_prueba,
                id : this._route.snapshot.paramMap.get('id')
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    if (result.error) {
                        this._messageService.add({
                            severity: 'error',
                            summary: 'ADVERTENCIA',
                            detail: result.message,
                            life: 9000
                        });
                    } else {
                        this._messageService.add({
                            severity: 'success',
                            summary: 'EXITO',
                            detail: `${result.detail.message}.`,
                            life: 9000
                        });
                        this.refreshDetailsOfficials();
                    }
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
        this._loadService.show();
        this._htService.getDetailsOfficials(this._route.snapshot.paramMap.get('id'),+this._route.snapshot.url[this._route.snapshot.url.length-3].path).subscribe(
            (resp) => {
                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.officialsList);
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

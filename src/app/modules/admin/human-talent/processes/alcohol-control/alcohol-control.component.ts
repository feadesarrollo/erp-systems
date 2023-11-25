import {Component, OnInit, Injectable, ChangeDetectorRef, ViewChild, Input} from '@angular/core';
import { takeUntil, Subject, switchMap, map, debounceTime } from 'rxjs';
import {HumanTalentService} from "../../human-talent.service";
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {Office} from "../../../claims-management/settings/settings.type";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {BobyLoadingService} from "../../../../../../@boby/services/loading";
import {ActivatedRoute, Router} from "@angular/router";
import {OfficeDialogComponent} from "../../../claims-management/settings/office/office-dialog/office-dialog.component";
import {AlcoholControlDialogComponent} from "./alcohol-control-dialog/alcohol-control-dialog.component";
import {BobyConfirmationService} from "../../../../../../@boby/services/confirmation";
import {ClaimDialogComponent} from "../../../claims-management/claims/claim/claim-dialog/claim-dialog.component";
import {WizardDialogComponent} from "../../../claims-management/claims/claim/wizard-dialog/wizard-dialog.component";
import {ClaimsService} from "../../../claims-management/claims/claims.service";
import {AlcoholControlGanttComponent} from "./alcohol-control-gantt/alcohol-control-gantt.component";
import {UploadFileComponent} from "../../../claims-management/claims/claim/claim-files/upload-file/upload-file.component";
import {ViewDocumentDialogComponent} from "./details-officials/view-document-dialog/view-document-dialog.component";
import {ViewDocGenDialogComponent} from "./view-doc-gen-dialog/view-doc-gen-dialog.component";

@Component({
  selector: 'erp-alcohol-control',
  templateUrl: './alcohol-control.component.html'
})
export class AlcoholControlComponent implements OnInit {



    selectedLottery: any = {};

    cols: any[] = [];
    submitted: boolean = false;
    oficinaDialog: boolean = false;
    deleteOficinaDialog: boolean = false;
    _selectedColumns: any[];
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pagination: any = [];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    loading: boolean;
    momento: string = '';
    public OficinaForm: FormGroup;
    public listaLugar: any;
    public displayedColumns = [ 'accion','nro_tramite','official','generation_date','start_range','end_range','estado','fecha_reg','fecha_mod','usr_reg','usr_mod','estado_reg'];

    public selectedUnits: any[] = [];
    private configForm: FormGroup;
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
        private _fcService: BobyConfirmationService,
        private _claimService: ClaimsService
    ) { }

    ngOnInit(): void {
        this.OficinaForm = this._formBuilder.group({
            id_oficina: [''],
            id_lugar: ['',[Validators.required]],
            codigo: ['',[Validators.required]],
            nombre: ['',[Validators.required]],
            correo_oficina: ['',[Validators.required]],
            aeropuerto: ['',[Validators.required]],
            direccion: ['',[Validators.required]]
        });

        this.cols = [
            { field: 'official', header: 'Funcionario', width: 'min-w-72'},
            { field: 'nro_tramite', header: 'Nro. Tramite', width: 'min-w-72'},
            { field: 'generation_date', header: 'Periodo Planificación', width: 'min-w-40'},
            { field: 'start_range', header: 'Fecha Inicial', width: 'min-w-40'},
            { field: 'end_range', header: 'Fecha Final', width: 'min-w-40'},


            { field: 'estado', header: 'Estado WF', width: 'min-w-32'},
            { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
            { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
            { field: 'estado_reg', header: 'Estado Reg.', width: 'min-w-32'},
            { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
            { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
        ];
        this._selectedColumns = this.cols;

        this._loadService.show();
        this._htService.getLotteryOfDays().subscribe(
            (resp) => {
                this.selectedUnits = resp.selectedList;

                this._loadService.hide();
                this.dataSource = new MatTableDataSource(resp.lotteryList);
                this.paginator._intl.itemsPerPageLabel="Registros por pagina";
                this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 de ${length }`;
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

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._htService.searchLotteryOfDays(query);
                }),
                map((search) => {
                    this.dataSource = new MatTableDataSource(search.lotteryList);
                    this.pagination = search.pagination;
                    this.isLoading = false;

                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    goToSiguiente(record: any): void
    {

        /*if ( record.estado == 'borrador_ps') {
            this._claimService.listFormColumn(record.id_estado_wf)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response: any) => {

                    const dialogRef = this._matDialog.open(ClaimDialogComponent, {
                        height: '90%',
                        width: '70%',
                        data: {
                            record: record
                        }
                    });

                    dialogRef.afterClosed()
                        .subscribe((result) => {
                            this.refreshPsychoactiveProgram();
                        });

                    this._changeDetectorRef.markForCheck();

                });
        }else {*/

            const dialogRef = this._matDialog.open(WizardDialogComponent, {
                height: '90%',
                width: '70%',
                data: {
                    id_proceso_wf: record.id_proceso_wf,
                    id_estado_wf: record.id_estado_wf,
                    endpoint:'organigrama/SorteoPruebaPsicoActiva/siguienteEstado'
                }
            });

            dialogRef.afterClosed()
                .subscribe((result) => {
                    if (result != undefined) {
                        if ( result.error ) {
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
                            this.refreshPsychoactiveProgram();
                        }
                    }
                });
        //}
    }


    openDialogLottery(): void{

        const dialogRef = this._matDialog.open(AlcoholControlDialogComponent,{
            height: '70%',
            width: '40%',
            data: {
                selectedUnits: this.selectedUnits
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
                            detail: `${result.detail.message}, Sorteo Generado.`,
                            life: 9000
                        });
                        this.refreshPsychoactiveProgram();
                    }
                }
            });
    }

    testQuery(): void{

    }


    executeCommand(valor: string){
        let dialogRef: any;
        switch (valor) {
            case 'delete':
                this.deleteLottery(this.selectedLottery);
                break;
            case 'gantt':
                dialogRef = this._matDialog.open(AlcoholControlGanttComponent,{
                    height: '90%',
                    width: '70%',
                    data: {
                        selectedLottery: this.selectedLottery
                    }
                });

                dialogRef.afterClosed()
                    .subscribe((result) => {

                    });
                break;
            case 'report':
                this.viewer_file = 'url';

                this.selectedLottery.viewer_file = this.viewer_file;

                this._loadService.show();
                this._htService.psychoactiveProgramReport(this.selectedLottery.id_proceso_wf, 'sis_organigrama/control/SorteoPruebaPsicoActiva/psychoactiveProgramReport/')
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response) => {
                        this._loadService.hide();
                        const detalle = response.detail;
                        this.selectedLottery.archivo_generado = detalle.message;
                        this.selectedLottery.viewer_file = this.viewer_file;
                        const dialogRef = this._matDialog.open(ViewDocGenDialogComponent, {
                            data: this.selectedLottery
                        });

                        dialogRef.afterClosed()
                            .subscribe((result) => {

                            });
                    });
                break;
        }
    }

    hideDialog() {
        this.oficinaDialog = false;
        this.submitted = false;
    }

    refreshPsychoactiveProgram(){
        this._htService.getLotteryOfDays().subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.lotteryList);
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

    deleteLottery(lottery) {
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
                this._loadService.show();
                this._htService.deleteLottery(lottery.id_control_sorteo_prueba).subscribe(
                    (resp) => {
                        this._loadService.hide();
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
                                detail: `Sorteo Eliminado!!`,
                                life: 9000
                            });
                            this.refreshPsychoactiveProgram();
                        }
                    }
                );
            }
        });
    }


}

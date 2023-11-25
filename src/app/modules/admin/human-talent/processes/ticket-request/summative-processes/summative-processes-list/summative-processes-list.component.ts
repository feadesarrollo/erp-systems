import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { SummativeProcessesService } from "../summative-processes.service";
import { takeUntil, Subject, Observable } from 'rxjs';
import { MatDrawer } from "@angular/material/sidenav";
import {FormControl} from "@angular/forms";
import {BobyMediaWatcherService} from "../../../../../../../../@boby/services/media-watcher";
@Component({
  selector: 'erp-summative-processes-list',
  templateUrl: './summative-processes-list.component.html'
})
export class SummativeProcessesListComponent implements OnInit {

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    public drawerMode: 'side' | 'over';
    public displayedColumns = [
        'accion','nombre_funcionario','start_date','end_date','summative_reason','estado_reg','fecha_reg','fecha_mod','usr_reg','usr_mod'
    ];
    public cols = [
        { field: 'nombre_funcionario', header: 'Nombre', width: 'min-w-80'},
        { field: 'start_date', header: 'Fecha Inicio', width: 'min-w-44'},
        { field: 'end_date', header: 'Fecha Fin', width: 'min-w-44'},
        { field: 'summative_reason', header: 'Motivo Sumario', width: 'min-w-80'},

        { field: 'estado_reg', header: 'Estado', width: 'min-w-32'},
        { field: 'fecha_reg', header: 'Fecha Reg.', width: 'min-w-32'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
        { field: 'usr_reg', header: 'Creado Por', width: 'min-w-44',},
        { field: 'usr_mod', header: 'Modificado Por', width: 'min-w-44'}
    ];

    private selectedSummative: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public summatives: any;
    public pagination: any;
    public searchInputControl: FormControl = new FormControl();
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _summativeService: SummativeProcessesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _bobyMediaWatcherService: BobyMediaWatcherService
    ) { }

    ngOnInit(): void {

        // Subscribe to media changes
        this._bobyMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._summativeService.summatives$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summatives: any[]) => {
                this.summatives = summatives;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._summativeService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this._summativeService.filterByQuery(0, 10, query).subscribe(resp =>{
            this._summativeService.summatives$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((summatives: any[]) => {
                    this.summatives = summatives;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            // Get the pagination
            this._summativeService.pagination$
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
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    redirect(row){
        this.selectedSummative = row;
        this._summativeService.statusSummative = 'edit';
        this._router.navigate(['./', row.id_summative_process], {relativeTo: this._activatedRoute});
    }

    selected(row){
        this.selectedSummative = row;
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                //this.showEditCustomerDialog(this.selectedCliente);
                break;
            case 'eliminar':
                this._summativeService.emitirEvento();
                break;
            case 'exportar':
                break;
        }
    }

    /**
     * Create summative
     */
    createSummative(): void{
        // Create the summative
        this._summativeService.createSummative().subscribe((newSummative) => {
            this.selectedSummative = newSummative;
            this._summativeService.statusSummative = 'new';
            // Go to the new summative
            this._router.navigate(['./', newSummative.id_summative_process], {relativeTo: this._activatedRoute});
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    refreshSummative(){
        this._summativeService.getSummativeProcess(0,10).subscribe(
            (resp) => {
                this.selectedSummative = resp.summatives.find(item => item.id_summative_process === this.selectedSummative.id_summative_process);
                this._summativeService.summative = this.selectedSummative;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

}

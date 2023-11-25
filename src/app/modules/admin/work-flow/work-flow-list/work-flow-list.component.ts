import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { takeUntil, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { WorkFlowService } from "../work-flow.service";


@Component({
    selector: 'erp-work-flow-list',
    templateUrl: './work-flow-list.component.html',
    styleUrls: ['./work-flow-list.component.scss']
})
export class WorkFlowListComponent implements OnInit {

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
    public displayedColumns = [ 'accion','official','ci','date','testdate','testtype','result','testconfirm','unit','occupation','office','place'];

    selectedProcess: any = {};
    listProcess: any = [];
    filteredProcess: any = [];
    filters: {
        query$: BehaviorSubject<string>;
    } = {
        query$        : new BehaviorSubject(''),
    };
    constructor(
        private _workService: WorkFlowService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.dataSource = new MatTableDataSource([]);


        /*this._workService.getListProcess().subscribe(
            (resp) => {
                this.listProcess = resp;
            }
        );*/

        // Get the courses
        this._workService.process$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((process: any[]) => {
                this.listProcess = this.filteredProcess = process;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Filter the process
        combineLatest([this.filters.query$])
            .subscribe(([query]) => {

                // Reset the filtered courses
                this.filteredProcess = this.listProcess;

                // Filter by search query
                if ( query !== '' )
                {
                    this.filteredProcess = this.filteredProcess.filter(process => process.nombre.toLowerCase().includes(query.toLowerCase())
                        || process.codigo.toLowerCase().includes(query.toLowerCase()));
                }

            });
    }

    refreshDetailsOfficials(){
        /*this._htService.getTestQuery( this.FilterForm.getRawValue() ).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.queryList);
                this.pagination = resp.pagination;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._changeDetectorRef.markForCheck();
            }
        );*/
    }

    executeCommand(option) {
        switch (option) {
            case 'test_detail':
                /*this.openTestOfficialDialog();*/
                break;
            case 'export':

        }
    }

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this.filters.query$.next(query);
    }

    clean(input){
        input.value = '';
        this.filterByQuery('');
    }
}

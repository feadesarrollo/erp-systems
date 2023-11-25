import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {cloneDeep} from "lodash-es";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Subject,takeUntil} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrganizationChartTicketService} from "../organization-chart-ticket.service";
import {MatCheckboxChange} from "@angular/material/checkbox";

@Component({
  selector: 'erp-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss']
})
export class ItemHistoryComponent implements OnInit {
    public selectedItem: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public displayedColumns = [
        'accion','nombre_unidad','usuario','fecha_mod'
    ];

    public cols = [
        { field: 'nombre_unidad', header: 'Nombre Item', width: 'min-w-72'},
        { field: 'usuario', header: 'Usuario', width: 'min-w-72'},
        { field: 'fecha_mod', header: 'Fecha Mod.', width: 'min-w-32'},
    ];

    private displayedColumnsCheck = cloneDeep(this.displayedColumns);
    private listCheck: any;
    private hiddenColumns = ['detalle_incidente','observaciones_incidente'];
    public pageSizeOptions: number[] = [5,10,20,30,40,50,100,200];
    public pageSize = 50;
    public isLoading: boolean = false;
    public pagination: any = {};
    public items: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private matDialogRef: MatDialogRef<ItemHistoryComponent>,
        private _ticket: OrganizationChartTicketService
    ) { }

    ngOnInit(): void {

        let col;
        this.displayedColumnsCheck.shift();
        this.listCheck = this.displayedColumnsCheck.map( (item,index) => {
            col = this.cols.find(elem => elem.field == item);
            if ( this.hiddenColumns.includes(col.field) ){
                this.displayedColumns = this.displayedColumns.filter( item => item !== col.field);
                return {field: col.field, header: col.header, width: col.width, checked: false, order: index + 1};
            }else{
                return {field: col.field, header: col.header, width: col.width, checked: true, order: index + 1};
            }
        });

        this._ticket.getUpdateHistory().subscribe(
            (items) => {
                // Get the pagination
                this._ticket.pagination$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((pagination: any) => {

                        // Update the pagination
                        this.pagination = pagination;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });

                // Get the claims

                this._ticket.item$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((items: any) => {

                        // Update the pagination
                        //this.claims = claims;
                        this.items = new MatTableDataSource(items);

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
                        this.items.paginator = this.paginator;
                        this.items.sort = this.sort;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            }
        );
    }

    /**
     * close
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    showOptions(event:MatCheckboxChange): void {
        const item = this.listCheck.filter((elem) => {
            if (elem.field == event.source.value){
                elem.checked = event.checked
                return elem;
            }
        });

        if (event.checked){
            this.displayedColumns.splice(item[0].order,0,event.source.value);
        }else{
            this.displayedColumns = this.displayedColumns.filter( item => item !== event.source.value);
        }
    }

}

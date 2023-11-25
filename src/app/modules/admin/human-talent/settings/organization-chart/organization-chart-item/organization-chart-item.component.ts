import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { OrganizationChartService } from "../organization-chart.service";
import { takeUntil, Observable, Subject } from 'rxjs';
@Component({
  selector: 'erp-organization-chart-item',
  templateUrl: './organization-chart-item.component.html'
})
export class OrganizationChartItemComponent implements OnInit {

    @Input() orgaChart: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public pagination: any = [];
    public items: any[] = [];

    public pageSizeOptions = [6, 12, 48, 99];
    constructor(
        private _orgaChartService: OrganizationChartService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {

        this._orgaChartService.getItems(this.orgaChart.id_uo,0,6).subscribe(resp =>{
            // Get the items
            this._orgaChartService.pagination$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagination: any) => {
                    // Update the pagination
                    this.pagination = pagination;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            // Get the items
            this._orgaChartService.items$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((customers: any[]) => {
                    this.items = customers;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });


    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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

}

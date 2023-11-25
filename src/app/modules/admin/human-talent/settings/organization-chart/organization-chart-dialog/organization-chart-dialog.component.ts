import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BobyMediaWatcherService } from "../../../../../../../@boby/services/media-watcher";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'erp-organization-chart-dialog',
    templateUrl: './organization-chart-dialog.component.html',
    styleUrls: ['./organization-chart-dialog.component.scss'],
    /*encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush*/
})
export class OrganizationChartDialogComponent implements OnInit {

    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    filter$: BehaviorSubject<string> = new BehaviorSubject('item');
    organizationDetail: any = {};
    orgaChart: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public matDialogRef: MatDialogRef<OrganizationChartDialogComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: BobyMediaWatcherService
    ) { }

    ngOnInit(): void {

        this.orgaChart = this._data.node;

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
     * Filter by section
     */
    filterByProcess(tipo: string): void
    {
        this.filter$.next(tipo);
    }

    /**
     * Get the filter section
     */
    get filterProcess(): string
    {
        return this.filter$.value;
    }

    /**
     * close
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }
}

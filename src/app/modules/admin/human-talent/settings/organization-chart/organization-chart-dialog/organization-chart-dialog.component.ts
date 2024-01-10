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
import {ActivatedRoute} from "@angular/router";
import {HumanTalentService} from "../../../human-talent.service";

@Component({
    selector: 'erp-organization-chart-dialog',
    templateUrl: './organization-chart-dialog.component.html',
    /*styleUrls: ['./organization-chart-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush*/
})
export class OrganizationChartDialogComponent implements OnInit {

    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    filter$: BehaviorSubject<string> = new BehaviorSubject('item');
    public id_uo: any = {};
    orgaChart: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: BobyMediaWatcherService,
        private _activatedRoute: ActivatedRoute,
        private _htService: HumanTalentService
    ) { }

    ngOnInit(): void {

        this.id_uo = this._activatedRoute.snapshot.paramMap.get('id');

        this._htService.selectedNode$.subscribe(
            (selected) =>{
                this.orgaChart = selected;
            }
        );
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
}

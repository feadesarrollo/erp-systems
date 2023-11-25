import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BobyHorizontalNavigationComponent } from '@boby/components/navigation/horizontal/horizontal.component';
import { BobyNavigationService } from '@boby/components/navigation/navigation.service';
import { BobyNavigationItem } from '@boby/components/navigation/navigation.types';
import { BobyUtilsService } from '@boby/services/utils/utils.service';

@Component({
    selector       : 'boby-horizontal-navigation-basic-item',
    templateUrl    : './basic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BobyHorizontalNavigationBasicItemComponent implements OnInit, OnDestroy
{
    @Input() item: BobyNavigationItem;
    @Input() name: string;

    isActiveMatchOptions: IsActiveMatchOptions;
    private _bobyHorizontalNavigationComponent: BobyHorizontalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _bobyNavigationService: BobyNavigationService,
        private _bobyUtilsService: BobyUtilsService
    )
    {
        // Set the equivalent of {exact: false} as default for active match options.
        // We are not assigning the item.isActiveMatchOptions directly to the
        // [routerLinkActiveOptions] because if it's "undefined" initially, the router
        // will throw an error and stop working.
        this.isActiveMatchOptions = this._bobyUtilsService.subsetMatchOptions;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Set the "isActiveMatchOptions" either from item's
        // "isActiveMatchOptions" or the equivalent form of
        // item's "exactMatch" option
        this.isActiveMatchOptions =
            this.item.isActiveMatchOptions ?? this.item.exactMatch
                ? this._bobyUtilsService.exactMatchOptions
                : this._bobyUtilsService.subsetMatchOptions;

        // Get the parent navigation component
        this._bobyHorizontalNavigationComponent = this._bobyNavigationService.getComponent(this.name);

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Subscribe to onRefreshed on the navigation component
        this._bobyHorizontalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {

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
}

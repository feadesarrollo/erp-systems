import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BooleanInput } from '@angular/cdk/coercion';
import { filter, Subject, takeUntil } from 'rxjs';
import { BobyVerticalNavigationComponent } from '@boby/components/navigation/vertical/vertical.component';
import { BobyNavigationService } from '@boby/components/navigation/navigation.service';
import { BobyNavigationItem } from '@boby/components/navigation/navigation.types';

@Component({
    selector       : 'boby-vertical-navigation-aside-item',
    templateUrl    : './aside.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BobyVerticalNavigationAsideItemComponent implements OnChanges, OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    static ngAcceptInputType_skipChildren: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() activeItemId: string;
    @Input() autoCollapse: boolean;
    @Input() item: BobyNavigationItem;
    @Input() name: string;
    @Input() skipChildren: boolean;

    active: boolean = false;
    private _bobyVerticalNavigationComponent: BobyVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _bobyNavigationService: BobyNavigationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        // Active item id
        if ( 'activeItemId' in changes )
        {
            // Mark if active
            this._markIfActive(this._router.url);
        }
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Mark if active
        this._markIfActive(this._router.url);

        // Attach a listener to the NavigationEnd event
        this._router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((event: NavigationEnd) => {

                // Mark if active
                this._markIfActive(event.urlAfterRedirects);
            });

        // Get the parent navigation component
        this._bobyVerticalNavigationComponent = this._bobyNavigationService.getComponent(this.name);

        // Subscribe to onRefreshed on the navigation component
        this._bobyVerticalNavigationComponent.onRefreshed.pipe(
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if the given item has the given url
     * in one of its children
     *
     * @param item
     * @param currentUrl
     * @private
     */
    private _hasActiveChild(item: BobyNavigationItem, currentUrl: string): boolean
    {
        const children = item.children;

        if ( !children )
        {
            return false;
        }

        for ( const child of children )
        {
            if ( child.children )
            {
                if ( this._hasActiveChild(child, currentUrl) )
                {
                    return true;
                }
            }

            // Skip items other than 'basic'
            if ( child.type !== 'basic' )
            {
                continue;
            }

            // Check if the child has a link and is active
            if ( child.link && this._router.isActive(child.link, child.exactMatch || false) )
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Decide and mark if the item is active
     *
     * @private
     */
    private _markIfActive(currentUrl: string): void
    {
        // Check if the activeItemId is equals to this item id
        this.active = this.activeItemId === this.item.id;

        // If the aside has a children that is active,
        // always mark it as active
        if ( this._hasActiveChild(this.item, currentUrl) )
        {
            this.active = true;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}

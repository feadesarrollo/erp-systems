import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { bobyAnimations } from '@boby/animations';
import { BobyNavigationItem } from '@boby/components/navigation/navigation.types';
import { BobyNavigationService } from '@boby/components/navigation/navigation.service';
import { BobyUtilsService } from '@boby/services/utils/utils.service';

@Component({
    selector       : 'boby-horizontal-navigation',
    templateUrl    : './horizontal.component.html',
    styleUrls      : ['./horizontal.component.scss'],
    animations     : bobyAnimations,
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'bobyHorizontalNavigation'
})
export class BobyHorizontalNavigationComponent implements OnChanges, OnInit, OnDestroy
{
    @Input() name: string = this._bobyUtilsService.randomId();
    @Input() navigation: BobyNavigationItem[];

    onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
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
        // Navigation
        if ( 'navigation' in changes )
        {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Make sure the name input is not an empty string
        if ( this.name === '' )
        {
            this.name = this._bobyUtilsService.randomId();
        }

        // Register the navigation component
        this._bobyNavigationService.registerComponent(this.name, this);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Deregister the navigation component from the registry
        this._bobyNavigationService.deregisterComponent(this.name);

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Refresh the component to apply the changes
     */
    refresh(): void
    {
        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Execute the observable
        this.onRefreshed.next(true);
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

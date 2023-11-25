import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from "@angular/material/sidenav";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import { PermissionsService } from "../permissions.service";
import {DOCUMENT} from "@angular/common";
import {BobyMediaWatcherService} from "@boby/services/media-watcher";
import { filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'erp-permissions-list',
  templateUrl: './permissions-list.component.html'
})
export class PermissionsListComponent implements OnInit {

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    roles$: Observable<any[]>;

    rolesCount: number = 0;
    countries: any[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedContact: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _adminService: PermissionsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: BobyMediaWatcherService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the contacts
        this.roles$ = this._adminService.roles$;

        this._adminService.roles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles: any[]) => {
                // Update the counts
                this.rolesCount = roles.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._adminService.role$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: any) => {

                // Update the selected contact
                this.selectedContact = contact;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        this._adminService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((countries: any[]) => {

                // Update the countries
                this.countries = countries;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>

                    // Search
                    this._adminService.searchContacts(query)
                )
            )
            .subscribe();

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened )
            {
                // Remove the selected contact when drawer closed
                this.selectedContact = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
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

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.createRole();
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
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create contact
     */
    createRole(): void
    {
        // Create the contact
        this._adminService.createRole().subscribe((newRole) => {
            this._adminService.statusPermission = 'new';
            // Go to the new contact
            this._router.navigate(['./', newRole.id], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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

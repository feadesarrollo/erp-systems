import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { filter, fromEvent, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { BobyMediaWatcherService } from '@boby/services/media-watcher';
import { AdministratorService } from '../../administrator.service';
import { RoleDetailsComponent } from "../role-details/role-details.component";

@Component({
    selector: 'erp-role-list',
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleListComponent implements OnInit {

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    @ViewChild(RoleDetailsComponent) child: RoleDetailsComponent;

    roles$: Observable<any[]>;
    rolesCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
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
        private _rolesService: AdministratorService,
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
        this.roles$ = this._rolesService.roles$;

        this._rolesService.roles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles: any[]) => {
                // Update the counts
                this.rolesCount = roles.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._rolesService.role$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: any) => {

                // Update the selected contact
                this.selectedContact = contact;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        this._rolesService.countries$
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
                    this._rolesService.searchContacts(query)
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
        // Create the role
        this._rolesService.createRole().subscribe((newRole) => {

            // Go to the new role
            this._router.navigate(['./', newRole.id], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Show dialog role
     */
    showRoleDialog(id_rol: number){
        this.child.toggleEditMode(true);
    }

    /**
     * Delete a group emails
     */
    deleteRole(id_rol: number){

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

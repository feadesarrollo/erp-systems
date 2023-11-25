import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BobyMediaWatcherService } from '@boby/services/media-watcher';
import { FileManagerService } from '../file-manager.service';
import {BobyMockApiUtils} from "@boby/lib/mock-api";

@Component({
    selector: 'erp-file-manager-list',
    templateUrl: './file-manager-list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerListComponent implements OnInit {

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: any;
    items: any = [];
    folders: any = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public guid = BobyMockApiUtils.guid();

    public selected = false;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
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
        // Get the items
        this._fileManagerService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                this.items = items;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                this.selectedItem = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        /*this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });*/
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
    }

    updateTemplate(template, id_template){
        if ( template ) {
            const files = this.items.files.map(item => item.id_template == id_template ? {
                ...item,
                content: template
            } : item);
            this.items.files = files;
            this._fileManagerService.items = this.items;

            this.selectedItem.content = template;
            this._fileManagerService.item = this.selectedItem;
            this._changeDetectorRef.markForCheck();
        }
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    /**
     * POST new file
     */
    newTemplateFile( folderId ){
        //system/claims-management/settings/customer/0
        //this._router.navigate([`details/${BobyMockApiUtils.guid()}`], {relativeTo: this._activatedRoute});
        // Mark for check
        //this._changeDetectorRef.markForCheck();
        /*const file =  {
            id         : BobyMockApiUtils.guid(),
            folderId   : folderId,
            name       : 'A personal folder',
            createdBy  : 'Brian Hughes',
            createdAt  : 'November 01, 2021',
            modifiedAt : 'November 01, 2021',
            type       : 'folder',
            contents   : '907 files',
            description: ''
        };*/

        // Create the contact
        this._fileManagerService.createTemplateFile().subscribe((newTemplateFile) => {

            // Go to the new contact
            this._router.navigate(['details/', newTemplateFile.json_template.id], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    redirect(url: string){
        //system/claims-management/settings/customer/0
        this._router.navigate([`${BobyMockApiUtils.guid()}`], {relativeTo: this._activatedRoute});
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}

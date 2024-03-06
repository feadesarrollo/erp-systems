import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatDrawer} from "@angular/material/sidenav";
import {BobyMockApiUtils} from "../../../../../../../@boby/lib/mock-api";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {ActivatedRoute, Router} from "@angular/router";
import {BobyMediaWatcherService} from "../../../../../../../@boby/services/media-watcher";
import {FileManagerService} from "../file-manager.service";

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
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fuseMediaWatcherService: BobyMediaWatcherService,
        private _fileService: FileManagerService
    ) { }

    ngOnInit(): void {
        // Get the items
        this._fileService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                this.items = items;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                this.selectedItem = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
            this._fileService.items = this.items;

            this.selectedItem.content = template;
            this._fileService.item = this.selectedItem;
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
        // Create the template
        this._fileService.createTemplateFile().subscribe((newTemplateFile) => {

            // Go to the new contact
            this._router.navigate(['details/', newTemplateFile.json_template.id], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    redirect(url: string){
        this._router.navigate([`${BobyMockApiUtils.guid()}`], {relativeTo: this._activatedRoute});
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

}
